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

    const languages = user.languagesKnown || [];
    if (languages.length === 0) {
      return NextResponse.json(
        { error: 'No programming languages specified' },
        { status: 400 }
      );
    }

    const difficulty = user.selfRatedSkillLevel || 'Beginner';
    const prompt = `You are a technical skill assessor. For a student who knows the following programming languages and technologies: ${languages.join(', ')} and has a self-rated proficiency of ${difficulty}, generate exactly 10 multiple choice questions to test their proficiency. 

The difficulty of the questions should be ${difficulty} level.

For each question provide:
- The question text
- Four options labeled A, B, C, D
- The correct answer (just the letter)

Mix easy, medium, and hard questions. Cover different aspects like syntax, concepts, best practices, and problem-solving.

Return the response as a valid JSON array where each object has fields:
- "question": string
- "options": array of 4 strings
- "correctAnswer": string (one of "A", "B", "C", "D")

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
      scores: { total: 0 },
      evaluatedLevel: '',
      strengths: [],
      weaknesses: [],
    });

    // Return questions without correct answers
    const questionsWithoutAnswers = questions.map((q: any) => ({
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json(
      { 
        message: 'Test generated successfully', 
        assessmentId: assessment._id,
        questions: questionsWithoutAnswers 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
