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

    const prompt = `Generate exactly 5 very short, simple, and fundamental interview questions for a ${domain} role.
    
These questions should:
- Be easy to understand and answer in a few sentences
- Focus on basic definitions and core concepts (e.g., "What is ${domain}?", "Explain the purpose of [key tool in ${domain}]")
- Be ideal for a quick communication and confidence check
- Avoid complex architecture or system design scenarios

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
        `What is ${domain} and what are its primary use cases?`,
        `What are the most important tools or libraries used in ${domain}?`,
        `Explain a core concept that every ${domain} developer should know.`,
        `What interested you most about working with ${domain}?`,
        `How do you handle common tasks or challenges in ${domain}?`,
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
  } catch (error: any) {
    console.error('Generate interview questions error:', error);
    return NextResponse.json(
      { error: `Generate Error: ${error?.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
