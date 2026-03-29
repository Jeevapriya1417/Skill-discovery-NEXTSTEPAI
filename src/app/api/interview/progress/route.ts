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
      .select('finalReport status createdAt');

    // Calculate trends
    const sessions = recentSessions.map(session => {
      const report = session.finalReport;
      
      // Calculate avg content score if report exists
      let avgContentScore = 0;
      if (report?.contentSummary) {
        const { relevance, clarity, depth } = report.contentSummary;
        avgContentScore = (relevance + clarity + depth) / 3;
      }

      return {
        date: session.createdAt,
        confidence: report?.overallConfidenceScore || 0,
        fillerCount: report?.vocalSummary?.averageFillerWords || 0,
        avgContentScore,
        status: session.status
      };
    });

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
