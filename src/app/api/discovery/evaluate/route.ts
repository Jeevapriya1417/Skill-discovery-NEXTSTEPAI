import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import Assessment from '@/models/Assessment';
import User from '@/models/User';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { assessmentId, userAnswers, checkOnly } = body;

    if (checkOnly) {
      const latestAssessment = await Assessment.findOne({ 
        userId: session.user.id,
        evaluatedLevel: { $ne: '' } 
      }).sort({ createdAt: -1 });

      if (latestAssessment) {
        return NextResponse.json(
          {
            message: 'Existing evaluation found',
            assessmentId: latestAssessment._id,
            score: latestAssessment.scores.total,
            evaluatedLevel: latestAssessment.evaluatedLevel,
            strengths: latestAssessment.strengths,
            weaknesses: latestAssessment.weaknesses,
            results: latestAssessment.results,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: 'No existing evaluation found' },
          { status: 404 }
        );
      }
    }

    if (!assessmentId || !userAnswers) {
      return NextResponse.json(
        { error: 'Assessment ID and answers are required' },
        { status: 400 }
      );
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Security check: Ensure this assessment belongs to the logged-in user
    if (assessment.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to assessment' },
        { status: 403 }
      );
    }

    // Separate MCQs for basic scoring, but let AI handle qualitative evaluation
    let mcqCorrect = 0;
    let totalMcq = 0;
    
    const assessmentDetails = assessment.questions.map((q: any, i: number) => {
      const isMcq = q.type === 'mcq';
      if (isMcq) {
        totalMcq++;
        if (userAnswers[i] === q.correctAnswer) mcqCorrect++;
      }
      return {
        question: q.question,
        type: q.type,
        userAnswer: userAnswers[i],
        correctAnswer: q.correctAnswer,
        isCorrect: isMcq ? userAnswers[i] === q.correctAnswer : 'AI to evaluate'
      };
    });

    const score = totalMcq > 0 ? Math.round((mcqCorrect / totalMcq) * 100) : 50;

    // Get user for context
    const user = await User.findById(assessment.userId);
    const languages = user?.languagesKnown || [];

    // Get AI evaluation
    const prompt = `You are a technical mentor. Evaluate a student's performance on a proficiency test.
Student knows: ${languages.join(', ')}

Test Results:
${assessmentDetails.map((d: any, i: number) => `
Question ${i + 1} (${d.type}): ${d.question}
User's Answer: ${d.userAnswer}
${d.type === 'mcq' ? `Correct Answer: ${d.correctAnswer}` : 'This is a coding problem, evaluate the logic and syntax.'}
`).join('\n')}

Based on ALL answers (especially the coding problems), provide:
1. A list of 3-4 strengths
2. A list of 3-4 weaknesses/areas for improvement
3. An overall proficiency level (Beginner, Intermediate, or Advanced)

Return as valid JSON with this structure:
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "evaluatedLevel": "...",
  "results": [
    {
      "question": "...",
      "type": "mcq/coding",
      "userAnswer": "...",
      "correctAnswer": "...",
      "sampleSolution": "...",
      "isCorrect": true/false/"AI evaluated",
      "feedback": "..."
    }
  ]
}

Only return the JSON, nothing else.`;

    const aiResponse = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(aiResponse);
    
    let evaluation;
    try {
      evaluation = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      evaluation = {
        strengths: ['Basic understanding of concepts'],
        weaknesses: ['Needs more practice'],
        evaluatedLevel: 'Beginner',
      };
    }

    // Update assessment
    assessment.answers = userAnswers;
    assessment.scores = { total: score };
    assessment.evaluatedLevel = evaluation.evaluatedLevel || 'Beginner';
    assessment.strengths = evaluation.strengths || [];
    assessment.weaknesses = evaluation.weaknesses || [];
    assessment.results = evaluation.results || [];
    await assessment.save();

    return NextResponse.json(
      {
        message: 'Evaluation completed',
        score,
        evaluatedLevel: assessment.evaluatedLevel,
        strengths: assessment.strengths,
        weaknesses: assessment.weaknesses,
        results: assessment.results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
