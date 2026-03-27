import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const bodyText = await req.text();
    console.log('Login request body text:', bodyText);
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error('Failed to parse login body as JSON:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      collegeName: user.collegeName,
      yearOfStudy: user.yearOfStudy,
      selfRatedSkillLevel: user.selfRatedSkillLevel,
      currentRole: user.currentRole,
      yearsOfExperience: user.yearsOfExperience,
      technologiesCurrentlyWorkingWith: user.technologiesCurrentlyWorkingWith,
      targetRole: user.targetRole,
      languagesKnown: user.languagesKnown,
      selectedDomain: user.selectedDomain,
    };

    return NextResponse.json(
      { message: 'Login successful', user: userResponse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error detail:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
