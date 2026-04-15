import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import User from '@/models/User';
import Assessment from '@/models/Assessment';
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

    const userId = authSession.user.id;

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
    const difficulty = user.selfRatedSkillLevel || 'Beginner';

    const levelGuidance = {
      'Beginner': 'Focus on fundamental syntax, basic role responsibilities, core tools, and standard workflows. Avoid deep architectural or complex optimization problems.',
      'Intermediate': 'Focus on practical problem-solving, debugging, modular design, common industry patterns, performance considerations, and team-level best practices.',
      'Advanced': 'Focus on large-scale system architecture, advanced optimization, security at scale, complex trade-off analysis, leadership in technical decisions, and emerging industry trends.'
    }[difficulty as 'Beginner' | 'Intermediate' | 'Advanced'] || 'Focus on professional proficiency.';

    if (!currentRole || !targetRole) {
      return NextResponse.json(
        { error: 'Current role and target role must be specified' },
        { status: 400 }
      );
    }

    const prompt = `A professional currently working as a ${currentRole} with ${experience} years of experience and skilled in ${technologies.join(', ')} wants to transition to a ${targetRole} position. They have self-rated their CURRENT proficiency as ${difficulty}.

Generate exactly 15 questions to assess their CURRENT skills (${currentRole}) so we know their baseline before providing a transition roadmap:
- 13 Multiple Choice Questions (MCQs)
- 2 Coding Problems (where they need to write code)

Assessment Level Guidance: ${levelGuidance}

Distribution:
- All 15 questions must be about their current role expertise (${currentRole}), explicitly at an ${difficulty} level. 
- Ensure the questions are challenging enough for a professional at this level.

For each MCQ, provide:
- "question": text
- "type": "mcq"
- "options": array of 4 strings labeled A, B, C, D
- "correctAnswer": the letter (A, B, C, or D)
- "tag": "current"

For each Coding Problem, provide:
- "question": text 
- "type": "coding"
- "tag": "current"

Return the response as a valid JSON array of objects.
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
      type: q.type,
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
