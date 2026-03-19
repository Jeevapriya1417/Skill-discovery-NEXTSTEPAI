import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import User from '@/models/User';

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

    const domain = user.selectedDomain || user.targetRole;
    if (!domain) {
      return NextResponse.json(
        { error: 'No domain or target role selected' },
        { status: 400 }
      );
    }

    const prompt = `Generate exactly 5 open-ended interview questions for a ${domain} communication round interview.

These questions should:
- Test the candidate's ability to explain technical concepts verbally and clearly
- Require detailed explanations, not one-word answers
- Focus on conceptual understanding and the ability to articulate thoughts
- Cover different aspects like system design, problem-solving, best practices, and real-world scenarios

Return as a valid JSON array of strings where each string is one question.

Only return the JSON array, nothing else.`;

    const response = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(response);
    
    let questions;
    try {
      questions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback questions
      questions = [
        `Explain your understanding of key concepts in ${domain}.`,
        `Walk me through how you would approach a complex problem in ${domain}.`,
        `Describe a challenging project you worked on and how you solved it.`,
        `What are the best practices you follow in ${domain}?`,
        `How do you stay updated with the latest trends in ${domain}?`,
      ];
    }

    return NextResponse.json(
      { 
        message: 'Interview questions generated successfully', 
        domain,
        questions 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate interview questions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
