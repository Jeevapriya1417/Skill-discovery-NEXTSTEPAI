import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import User from '@/models/User';
import Assessment from '@/models/Assessment';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentRole = user.currentRole;
    const targetRole = user.targetRole;
    const experience = user.yearsOfExperience || 0;
    const technologies = user.technologiesCurrentlyWorkingWith || [];

    if (!currentRole || !targetRole) {
      return NextResponse.json(
        { error: 'Current role and target role must be specified' },
        { status: 400 }
      );
    }

    const prompt = `A professional currently working as a ${currentRole} with ${experience} years of experience and skilled in ${technologies.join(', ')} wants to transition to a ${targetRole} position.

Generate exactly 15 multiple choice questions to assess their current skills and readiness for the target role:
- 7 questions about their current role expertise
- 8 questions about foundational knowledge needed for the target role

For each question provide:
- The question text
- Four options labeled A, B, C, D
- The correct answer (just the letter)
- A tag indicating whether it tests "current" role skills or "target" role skills

Return the response as a valid JSON array where each object has fields:
- "question": string
- "options": array of 4 strings
- "correctAnswer": string (one of "A", "B", "C", "D")
- "tag": string (either "current" or "target")

Only return the JSON array, nothing else.`;

    const response = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(response);
    
    let questions;
    try {
      questions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse questions from AI' },
        { status: 500 }
      );
    }

    // Save assessment to database
    const assessment = await Assessment.create({
      userId,
      questions,
      answers: [],
      scores: { total: 0, currentRoleScore: 0, targetRoleScore: 0 },
      evaluatedLevel: '',
      strengths: [],
      weaknesses: [],
    });

    // Return questions without correct answers
    const questionsWithoutAnswers = questions.map((q: any) => ({
      question: q.question,
      options: q.options,
      tag: q.tag,
    }));

    return NextResponse.json(
      { 
        message: 'Gap analysis test generated successfully', 
        assessmentId: assessment._id,
        questions: questionsWithoutAnswers 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate gap test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
