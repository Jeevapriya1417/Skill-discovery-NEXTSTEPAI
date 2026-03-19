import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import User from '@/models/User';
import Assessment from '@/models/Assessment';
import Recommendation from '@/models/Recommendation';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

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

    // Get latest assessment
    const assessment = await Assessment.findOne({ userId }).sort({ createdAt: -1 });
    if (!assessment) {
      return NextResponse.json(
        { error: 'No assessment found. Please complete a proficiency test first.' },
        { status: 400 }
      );
    }

    const languages = user.languagesKnown || [];
    const strengths = assessment.strengths || [];
    const weaknesses = assessment.weaknesses || [];
    const level = assessment.evaluatedLevel;

    const prompt = `Based on a student with the following profile:
- Programming languages known: ${languages.join(', ')}
- Skill level: ${level}
- Strengths: ${strengths.join(', ')}
- Areas to improve: ${weaknesses.join(', ')}

Suggest 4 suitable technical career domains for this student. For each domain:
1. Provide the domain name (e.g., "Data Science", "Backend Development", "Frontend Development", "DevOps")
2. Explain why this domain matches their skills (2-3 sentences)

Return as a valid JSON array where each object has:
- "domain": string
- "matchReason": string

Only return the JSON array, nothing else.`;

    const response = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(response);
    
    let suggestedDomains;
    try {
      suggestedDomains = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback domains
      suggestedDomains = [
        { domain: 'Web Development', matchReason: 'Good foundation for building web applications' },
        { domain: 'Data Science', matchReason: 'Strong analytical skills needed for data analysis' },
        { domain: 'Mobile Development', matchReason: 'Growing field with many opportunities' },
        { domain: 'Cloud Computing', matchReason: 'High demand for cloud infrastructure skills' },
      ];
    }

    // Save recommendation
    await Recommendation.create({
      userId,
      suggestedDomains,
      matchReasons: suggestedDomains.map((d: any) => d.matchReason),
    });

    return NextResponse.json(
      {
        message: 'Domain suggestions generated',
        suggestedDomains,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Domain suggestion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
