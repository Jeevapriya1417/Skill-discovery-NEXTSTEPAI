import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
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

    const { role } = await req.json();

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    const userId = authSession.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { targetRole: role },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Target role updated successfully', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Select role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
