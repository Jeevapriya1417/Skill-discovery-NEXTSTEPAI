import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import InterviewSession from '@/models/InterviewSession';
import UserProgress from '@/models/UserProgress';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Security check: Ensure this session belongs to the logged-in user
    if (session.userId.toString() !== authSession.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to session' },
        { status: 403 }
      );
    }

    // 1. Prepare Bulk Context for Gemini
    const allTranscripts = [
      `Section 1 (Introduction): ${session.section1.transcript}`,
      ...session.section2.map((q: any, i: number) => `Section 2, Q${i+1} (${q.question}): ${q.transcript}`),
      ...session.section3.questions.map((q: any, i: number) => `Section 3, Q${i+1} (${q.question}): ${q.transcript}${q.code ? `\nCode provided:\n${q.code}` : ''}`),
      `Section 4 (Topic: ${session.section4.topic}): ${session.section4.transcript}`
    ].join('\n\n---\n\n');

    const bulkPrompt = `Task: Perform a comprehensive evaluation of the following mock interview for a ${session.domain} role.

INTERVIEW CONTEXT:
${allTranscripts}

Based on all the answers above, provide a detailed evaluation.
1. Technical Score (0-100): Based on the accuracy and depth of technical answers (especially Section 2 and 3).
2. Problem Solving Score (0-100): Based on the logical approach in Section 3.
3. Content Summary:
   - Relevance (0-100): Overall how well did they stay on topic?
   - Clarity (0-100): Overall communication clarity.
   - Depth (0-100): Overall thoroughness of technical explanations.
4. Section Scores:
   - Section 1 Score (0-100): Confidence and introduction quality.
   - Section 2 Score (0-100): Domain knowledge accuracy.
   - Section 3 Score (0-100): Coding/Problem solving quality.
   - Section 4 Score (0-100): Fluency on general topics.
5. Provide 4 personalized improvement tips.
6. Provide a 2-3 sentence overall conclusion.

Return ONLY a valid JSON object:
{
  "technicalScore": Number,
  "problemSolvingScore": Number,
  "contentSummary": {
    "relevance": Number,
    "clarity": Number,
    "depth": Number
  },
  "sectionScores": {
    "s1": Number,
    "s2": Number,
    "s3": Number,
    "s4": Number
  },
  "tips": ["tip1", "tip2", "tip3", "tip4"],
  "conclusion": "string"
}`;

    const aiResponse = await askGemini(bulkPrompt);
    const feedbackResult = JSON.parse(sanitizeJsonResponse(aiResponse));

    // 2. Global Vocal Summary (Calculated locally from saved metrics)
    const allMetrics = [
      session.section1.vocalMetrics,
      ...session.section2.map((q: any) => q.vocalMetrics),
      ...session.section3.questions.map((q: any) => q.vocalMetrics),
      session.section4.vocalMetrics
    ].filter(m => !!m);

    const vocalConfidenceScore = Math.round((session.section1.score + session.section4.score) / 2);
    const totalFillers = allMetrics.reduce((sum: number, m: any) => sum + m.fillerWordCount.total, 0);
    const averageFillerWords = Math.round(totalFillers / (allMetrics.length || 1));
    const averageWPM = Math.round(allMetrics.reduce((sum, m) => sum + m.speakingPace.wordsPerMinute, 0) / (allMetrics.length || 1));

    // 3. Final Overall Score (Weighted)
    // Vocal: 20%, Technical: 50%, Problem Solving: 30%
    const overallInterviewScore = Math.round(
      (vocalConfidenceScore * 0.2) + 
      (feedbackResult.technicalScore * 0.5) + 
      (feedbackResult.problemSolvingScore * 0.3)
    );

    // 4. Update Session Final Report
    session.finalReport = {
      overallConfidenceScore: vocalConfidenceScore,
      technicalScore: feedbackResult.technicalScore,
      problemSolvingScore: feedbackResult.problemSolvingScore,
      vocalSummary: {
        averageFillerWords,
        averageWPM,
        clarity: averageFillerWords < 3 ? 'Excellent' : averageFillerWords < 7 ? 'Good' : 'Needs Improvement'
      },
      contentSummary: {
        relevance: feedbackResult.contentSummary.relevance,
        clarity: feedbackResult.contentSummary.clarity,
        depth: feedbackResult.contentSummary.depth,
      },
      sectionBreakdown: {
        section1: feedbackResult.sectionScores.s1,
        section2: feedbackResult.sectionScores.s2,
        section3: feedbackResult.sectionScores.s3,
        section4: feedbackResult.sectionScores.s4
      },
      personalizedTips: feedbackResult.tips
    };

    session.status = 'completed';
    await session.save();

    // 5. Update UserProgress
    let progress = await UserProgress.findOne({ userId: session.userId });
    if (progress) {
      progress.sessionHistory.push(session._id);
      progress.totalSessions += 1;
      progress.confidenceTrend = overallInterviewScore;
      await progress.save();
    } else {
      await UserProgress.create({
        userId: session.userId,
        sessionHistory: [session._id],
        totalSessions: 1,
        confidenceTrend: overallInterviewScore
      });
    }

    return NextResponse.json({ 
      message: 'Comprehensive feedback generated successfully', 
      session,
      conclusion: feedbackResult.conclusion
    });

  } catch (error: any) {
    console.error('Feedback generation error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error?.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
