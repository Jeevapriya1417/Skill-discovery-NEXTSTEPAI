import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GapAnalysis from '@/models/GapAnalysis';

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
