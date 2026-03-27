import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, currentRole, targetRole } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Finding user by ID:', userId);
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Updating roles for user:', user.email);
    user.currentRole = currentRole;
    user.targetRole = targetRole;
    
    await user.save();
    console.log('Roles saved successfully');

    return NextResponse.json({
      message: 'Roles updated successfully',
      user: {
        currentRole: user.currentRole,
        targetRole: user.targetRole
      }
    });
  } catch (error: any) {
    console.error('Update roles error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}
