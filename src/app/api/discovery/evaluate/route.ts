import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import Assessment from '@/models/Assessment';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { assessmentId, userAnswers } = await req.json();

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

    // Calculate score
    let correctCount = 0;
    const wrongQuestions: any[] = [];

    assessment.questions.forEach((q: any, index: number) => {
      if (userAnswers[index] === q.correctAnswer) {
        correctCount++;
      } else {
        wrongQuestions.push({
          question: q.question,
          userAnswer: userAnswers[index],
          correctAnswer: q.correctAnswer,
        });
      }
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);

    // Determine level
    let evaluatedLevel = 'Beginner';
    if (score >= 80) evaluatedLevel = 'Advanced';
    else if (score >= 50) evaluatedLevel = 'Intermediate';

    // Get user for context
    const user = await User.findById(assessment.userId);
    const languages = user?.languagesKnown || [];

    // Get AI evaluation
    const prompt = `A student who knows ${languages.join(', ')} scored ${score}% (${correctCount} out of ${assessment.questions.length}) on a proficiency test.

Questions they got wrong:
${wrongQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

Based on this, provide:
1. A list of their strengths (topics they understand well)
2. A list of their weaknesses (topics they need to improve)

Return as valid JSON with this structure:
{
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...]
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
      };
    }

    // Update assessment
    assessment.answers = userAnswers;
    assessment.scores = { total: score };
    assessment.evaluatedLevel = evaluatedLevel;
    assessment.strengths = evaluation.strengths || [];
    assessment.weaknesses = evaluation.weaknesses || [];
    await assessment.save();

    return NextResponse.json(
      {
        message: 'Evaluation completed',
        score,
        evaluatedLevel,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
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
