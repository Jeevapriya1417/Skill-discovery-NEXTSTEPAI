import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import User from '@/models/User';
import InterviewSession from '@/models/InterviewSession';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const domain = user.selectedDomain || user.targetRole;
    if (!domain) {
      return NextResponse.json({ error: 'No domain or target role selected' }, { status: 400 });
    }

    // Check for existing in-progress session
    let session = await InterviewSession.findOne({ userId, status: 'in-progress' });

    if (session) {
      return NextResponse.json({ 
        message: 'Resuming existing session', 
        session,
        isNew: false 
      });
    }

    // Determine domain type (Coding vs Non-coding)
    const typePrompt = `Classify the following career domain as either "Coding" (software development, programming, etc.) or "Non-Coding" (design, management, marketing, etc.): "${domain}". 
    Reply with ONLY the word "Coding" or "Non-Coding".`;
    
    const domainTypeResponse = await askGemini(typePrompt);
    const isCoding = domainTypeResponse.trim().includes('Coding');
    const section3Type = isCoding ? '3A' : '3B';

    // Generate Section 2 (10 questions), Section 3 (2 questions), and Section 4 (1 topic)
    const questionsPrompt = `Generate interview questions for a ${domain} role.
    
    1. Generate exactly 10 domain-specific interview questions for Section 2. These should be fundamental yet focused on the specific role.
    2. Generate exactly 2 questions for Section 3:
       - If the domain is coding-related, generate 2 beginner-friendly coding fundamentals questions (e.g. "How would you implement a binary search?").
       - If not, generate 2 situational, real-world scenario questions (e.g. "How would you handle a difficult client?").
    3. Generate exactly 1 non-technical general speaking topic for Section 4 (e.g. "Describe your dream house", "Impact of AI on society").

    Return the result as a valid JSON object with this structure:
    {
      "section2": ["q1", "q2", ..., "q10"],
      "section3": ["q1", "q2"],
      "section4": "topic text"
    }
    
    Only return the JSON, nothing else.`;

    const questionsResponse = await askGemini(questionsPrompt);
    const cleanedJsonResponse = sanitizeJsonResponse(questionsResponse);
    const questionsData = JSON.parse(cleanedJsonResponse);

    // Create new session
    session = new InterviewSession({
      userId,
      domain,
      status: 'in-progress',
      currentSection: 1,
      currentQuestionIndex: 0,
      section2: questionsData.section2.map((q: string) => ({ question: q })),
      section3: {
        sectionType: section3Type,
        questions: questionsData.section3.map((q: string) => ({ question: q }))
      },
      section4: {
        topic: questionsData.section4
      }
    });

    await session.save();

    return NextResponse.json({ 
      message: 'New session started', 
      session,
      isNew: true 
    });

  } catch (error: any) {
    console.error('Start interview session error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error?.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
