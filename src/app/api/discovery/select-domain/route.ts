import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { userId, domain } = await req.json();

    if (!userId || !domain) {
      return NextResponse.json(
        { error: 'User ID and domain are required' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { selectedDomain: domain } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Domain selected successfully',
        selectedDomain: domain,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Domain selection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
