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
    const prompt = `You are a technical skill assessor. For a student who knows the following programming languages and technologies: ${languages.join(', ')} and has a self-rated proficiency of ${difficulty}, generate exactly 10 questions to test their proficiency. 

The test must include:
- 8 Multiple Choice Questions (MCQs)
- 2 Coding Problems (where they need to write code)

The difficulty of the questions should be ${difficulty} level.

For each MCQ provide:
- "question": text
- "type": "mcq"
- "question": text
- "type": "mcq"
- "options": exactly 4 strings in a flat array (e.g., ["option1", "option2", "option3", "option4"])
- "correctAnswer": the letter (A, B, C, or D)

For each Coding Problem provide:
- "question": text describing the problem and requirements
- "type": "coding"
- "correctAnswer": a sample solution or key logic to look for (optional but helpful)

Return the response as a valid JSON array of objects.
Only return the JSON array, nothing else.`;

    const response = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(response);
    
    let questions;
    try {
      questions = JSON.parse(cleanedResponse);

      // Normalize questions to match schema
      if (Array.isArray(questions)) {
        questions = questions.map((q: any) => {
          if (q.type === 'mcq' && q.options) {
            // If options is an array of objects like [{A: '...'}, {B: '...'}] or {A: '...', B: '...'}
            if (Array.isArray(q.options) && q.options.length > 0 && typeof q.options[0] === 'object') {
              const firstObj = q.options[0];
              q.options = [firstObj.A, firstObj.B, firstObj.C, firstObj.D].filter(Boolean);
            } else if (!Array.isArray(q.options) && typeof q.options === 'object') {
              q.options = [q.options.A, q.options.B, q.options.C, q.options.D].filter(Boolean);
            }
            
            // Final fallback: ensure it's an array of strings
            if (!Array.isArray(q.options)) {
              q.options = [];
            } else {
              q.options = q.options.map((opt: any) => String(opt));
            }
          } else if (q.type === 'mcq' && !q.options) {
            q.options = [];
          }
          return q;
        });
      }
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
      type: q.type,
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
