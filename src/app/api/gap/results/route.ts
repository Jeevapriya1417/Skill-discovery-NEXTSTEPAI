import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GapAnalysis from '@/models/GapAnalysis';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
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

    const gapAnalysis = await GapAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!gapAnalysis) {
      return NextResponse.json(
        { error: 'No gap analysis found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        gapAnalysis: {
          currentRole: gapAnalysis.currentRole,
          targetRole: gapAnalysis.targetRole,
          transferableSkills: gapAnalysis.transferableSkills,
          skillGaps: gapAnalysis.skillGaps,
          readinessPercentage: gapAnalysis.readinessPercentage,
          createdAt: gapAnalysis.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gap results fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
