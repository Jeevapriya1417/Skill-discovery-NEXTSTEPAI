import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import User from '@/models/User';
import GapAnalysis from '@/models/GapAnalysis';
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

    const gapAnalysis = await GapAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    if (!gapAnalysis) {
      return NextResponse.json(
        { error: 'No gap analysis found. Please complete the assessment first.' },
        { status: 400 }
      );
    }

    const targetRole = user.targetRole;
    const skillGaps = gapAnalysis.skillGaps || [];
    const transferableSkills = gapAnalysis.transferableSkills || [];

    const prompt = `Create a focused transition roadmap for a professional moving to a ${targetRole} role.

Their profile:
- Transferable skills: ${transferableSkills.join(', ')}
- Skill gaps to address: ${skillGaps.map((g: any) => `${g.skill} (${g.severity})`).join(', ')}

Create a roadmap that:
1. Lists topics they can skip (what they already know from transferable skills)
2. Lists focus areas to learn (based on skill gaps, ordered by priority - High severity first). For each focus area, include 2-3 specific learningLinks to high-quality free resources like YouTube, freeCodeCamp, documentation, etc. The URL should be a real applicable link.
3. Includes estimated duration for each focus area
4. Provides total estimated transition time

Return as valid JSON with this structure:
{
  "skip": ["topic 1", "topic 2", ...],
  "focusAreas": [
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

Include 5-7 focus areas. Only return the JSON, nothing else.`;

    const response = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(response);
    
    let roadmapData;
    try {
      roadmapData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback roadmap
      roadmapData = {
        skip: transferableSkills,
        focusAreas: skillGaps.map((gap: any, index: number) => ({
          stage: index + 1,
          topic: gap.skill,
          estimatedDuration: gap.severity === 'High' ? '4 weeks' : gap.severity === 'Medium' ? '3 weeks' : '2 weeks',
          learningLinks: []
        })),
        totalEstimatedTime: '3 months',
      };
    }

    // Save roadmap
    const roadmap = await Roadmap.create({
      userId,
      type: 'gap',
      domain: targetRole || '',
      alreadyCovered: roadmapData.skip || [],
      toLearn: roadmapData.focusAreas || [],
      totalEstimatedTime: roadmapData.totalEstimatedTime || '3 months',
    });

    return NextResponse.json(
      {
        message: 'Transition roadmap generated successfully',
        roadmap: {
          _id: roadmap._id,
          targetRole,
          skip: roadmap.alreadyCovered,
          focusAreas: roadmap.toLearn,
          totalEstimatedTime: roadmap.totalEstimatedTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gap roadmap generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
