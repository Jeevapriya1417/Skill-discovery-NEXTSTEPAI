import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InterviewSession from '@/models/InterviewSession';
import UserProgress from '@/models/UserProgress';

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

    // Get user progress
    const userProgress = await UserProgress.findOne({ userId });
    
    // Get recent sessions
    const recentSessions = await InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('overallConfidence vocalMetrics contentScores createdAt');

    // Calculate trends
    const sessions = recentSessions.map(session => ({
      date: session.createdAt,
      confidence: session.overallConfidence,
      fillerCount: session.vocalMetrics.reduce((sum, vm) => 
        sum + vm.fillerWordCount.total, 0
      ) / session.vocalMetrics.length,
      avgContentScore: session.contentScores.reduce((sum, cs) => 
        sum + (cs.relevanceScore + cs.clarityScore + cs.depthScore) / 3, 0
      ) / session.contentScores.length,
    }));

    return NextResponse.json(
      { 
        progress: {
          totalSessions: userProgress?.totalSessions || 0,
          fillerTrend: userProgress?.fillerTrend || 'Stable',
          paceTrend: userProgress?.paceTrend || 'Stable',
          confidenceTrend: userProgress?.confidenceTrend || 0,
          sessions,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
