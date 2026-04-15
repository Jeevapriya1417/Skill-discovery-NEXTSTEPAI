import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import User from '@/models/User';
import Assessment from '@/models/Assessment';
import Roadmap from '@/models/Roadmap';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
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

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const domainParam = searchParams.get('domain');

    if (!user.selectedDomain && !domainParam) {
      return NextResponse.json(
        { error: 'No domain provided.' },
        { status: 400 }
      );
    }

    const assessment = await Assessment.findOne({ userId }).sort({ createdAt: -1 });
    
    const languages = user.languagesKnown || [];
    const strengths = assessment?.strengths || [];
    const domain = domainParam || user.selectedDomain;

    if (!domain) {
      return NextResponse.json(
        { error: 'No domain provided.' },
        { status: 400 }
      );
    }

    // Check for existing roadmap for this user and domain
    const existingRoadmap = await Roadmap.findOne({ userId, domain }).sort({ createdAt: -1 });
    if (existingRoadmap) {
      return NextResponse.json(
        {
          message: 'Roadmap retrieved from database',
          roadmap: {
            _id: existingRoadmap._id,
            domain: existingRoadmap.domain,
            alreadyCovered: existingRoadmap.alreadyCovered,
            toLearn: existingRoadmap.toLearn,
            totalEstimatedTime: existingRoadmap.totalEstimatedTime,
          },
        },
        { status: 200 }
      );
    }

    const prompt = `Create a personalized learning roadmap for a student who wants to become a ${domain}.

Student profile:
- Already knows: ${languages.join(', ')}
- Strong in: ${strengths.join(', ')}

Create a roadmap with:
1. Topics already covered (what they already know)
2. Topics to learn (in order, with estimated duration for each, and 2-3 specific learningLinks to high-quality free resources like YouTube, freeCodeCamp, documentation, etc). The URL should be a real applicable link.
3. Total estimated time to become job-ready

Return as valid JSON with this structure:
{
  "alreadyCovered": ["topic 1", "topic 2"],
  "toLearn": [
    { 
      "stage": 1, 
      "topic": "topic name", 
      "estimatedDuration": "X weeks",
      "learningLinks": [
        { "title": "Resource Title", "url": "https://..." }
      ]
    }
  ],
  "totalEstimatedTime": "X months"
}

Include 6-8 topics to learn. Only return the JSON, nothing else.`;

    const response = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(response);
    
    let roadmapData;
    try {
      roadmapData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback roadmap
      roadmapData = {
        alreadyCovered: languages,
        toLearn: [
          { stage: 1, topic: 'Fundamentals', estimatedDuration: '2 weeks' },
          { stage: 2, topic: 'Core Concepts', estimatedDuration: '3 weeks' },
          { stage: 3, topic: 'Advanced Topics', estimatedDuration: '4 weeks' },
          { stage: 4, topic: 'Frameworks & Tools', estimatedDuration: '3 weeks' },
          { stage: 5, topic: 'Real-world Projects', estimatedDuration: '4 weeks' },
        ],
        totalEstimatedTime: '4 months',
      };
    }

    // Only save the roadmap if domainParam matches user.selectedDomain or user already has a domain
    // If we're just previewing, we can avoid saving, or we can save it anyway for history. Let's just create it anyway.
    const roadmap = await Roadmap.create({
      userId,
      type: 'discovery',
      domain,
      alreadyCovered: roadmapData.alreadyCovered || [],
      toLearn: roadmapData.toLearn || [],
      totalEstimatedTime: roadmapData.totalEstimatedTime || '3 months',
    });

    return NextResponse.json(
      {
        message: 'Roadmap generated successfully',
        roadmap: {
          _id: roadmap._id,
          domain,
          alreadyCovered: roadmap.alreadyCovered,
          toLearn: roadmap.toLearn,
          totalEstimatedTime: roadmap.totalEstimatedTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
