import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import InterviewSession from '@/models/InterviewSession';
import UserProgress from '@/models/UserProgress';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { 
      userId, 
      domain, 
      questions, 
      transcripts, 
      vocalMetrics, 
      contentScores 
    } = await req.json();

    if (!userId || !domain || !questions || !transcripts || !vocalMetrics || !contentScores) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate overall confidence score
    const avgContentScore = contentScores.reduce((sum: number, cs: any) => 
      sum + (cs.relevanceScore + cs.clarityScore + cs.depthScore) / 3, 0
    ) / contentScores.length;

    const avgFillerCount = vocalMetrics.reduce((sum: number, vm: any) => 
      sum + vm.fillerWordCount.total, 0
    ) / vocalMetrics.length;

    const fillerPenalty = Math.min(avgFillerCount * 2, 20);
    const overallConfidence = Math.round(Math.max(0, avgContentScore - fillerPenalty));

    // Generate AI feedback
    const prompt = `Based on a mock interview session with the following metrics:

Overall Confidence: ${overallConfidence}%
Average Filler Words per Answer: ${Math.round(avgFillerCount)}
Speaking Pace Issues: ${vocalMetrics.filter((vm: any) => vm.speakingPace.evaluation !== 'Optimal').length} answers

Provide:
1. Vocal feedback - specific areas to improve in speech delivery
2. Content feedback - specific areas to improve in answer substance
3. 3-4 actionable improvement tips

Return as valid JSON:
{
  "vocalFeedback": "string",
  "contentFeedback": "string",
  "improvementTips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}

Only return the JSON, nothing else.`;

    const aiResponse = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(aiResponse);
    
    let feedback;
    try {
      feedback = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      feedback = {
        vocalFeedback: 'Practice speaking more clearly and reduce filler words.',
        contentFeedback: 'Provide more specific examples in your answers.',
        improvementTips: [
          'Reduce filler words by pausing briefly instead of saying "um"',
          'Structure your answers with clear beginning, middle, and end',
          'Include specific examples from your experience',
          'Practice speaking at a moderate pace',
        ],
      };
    }

    // Save interview session
    const session = await InterviewSession.create({
      userId,
      domain,
      questions,
      transcripts,
      vocalMetrics,
      contentScores,
      overallConfidence,
      feedback: {
        vocalFeedback: feedback.vocalFeedback || '',
        contentFeedback: feedback.contentFeedback || '',
        improvementTips: feedback.improvementTips || [],
      },
    });

    // Update user progress
    const userProgress = await UserProgress.findOne({ userId });
    if (userProgress) {
      userProgress.sessionHistory.push(session._id);
      userProgress.totalSessions += 1;
      
      // Calculate trends (simplified)
      const recentSessions = await InterviewSession.find({ 
        userId 
      }).sort({ createdAt: -1 }).limit(3);
      
      if (recentSessions.length >= 2) {
        const recentFiller = recentSessions[0].vocalMetrics.reduce((sum, vm) => 
          sum + vm.fillerWordCount.total, 0
        ) / recentSessions[0].vocalMetrics.length;
        
        const prevFiller = recentSessions[1].vocalMetrics.reduce((sum, vm) => 
          sum + vm.fillerWordCount.total, 0
        ) / recentSessions[1].vocalMetrics.length;
        
        userProgress.fillerTrend = recentFiller < prevFiller ? 'Decreasing' : 
                                   recentFiller > prevFiller ? 'Increasing' : 'Stable';
        
        const recentConfidence = recentSessions[0].overallConfidence;
        const prevConfidence = recentSessions[1].overallConfidence;
        userProgress.confidenceTrend = recentConfidence - prevConfidence;
      }
      
      await userProgress.save();
    } else {
      await UserProgress.create({
        userId,
        sessionHistory: [session._id],
        totalSessions: 1,
      });
    }

    return NextResponse.json(
      { 
        message: 'Feedback generated successfully',
        sessionId: session._id,
        overallConfidence,
        feedback: {
          vocalFeedback: feedback.vocalFeedback || '',
          contentFeedback: feedback.contentFeedback || '',
          improvementTips: feedback.improvementTips || [],
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Feedback generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
