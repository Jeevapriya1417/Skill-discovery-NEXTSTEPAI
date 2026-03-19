import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const bodyText = await req.text();
    console.log('Registration request body text:', bodyText);
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error('Failed to parse registration body as JSON:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { 
      name, 
      email, 
      password, 
      userType, 
      collegeName, 
      yearOfStudy, 
      selfRatedSkillLevel,
      currentRole, 
      yearsOfExperience,
      technologiesCurrentlyWorkingWith,
      targetRole, 
      languagesKnown 
    } = body;

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
      collegeName: userType === 'student' ? collegeName : undefined,
      yearOfStudy: userType === 'student' ? yearOfStudy : undefined,
      selfRatedSkillLevel: userType === 'student' ? selfRatedSkillLevel : undefined,
      currentRole: userType === 'professional' ? currentRole : undefined,
      yearsOfExperience: userType === 'professional' ? yearsOfExperience : undefined,
      technologiesCurrentlyWorkingWith: userType === 'professional' ? technologiesCurrentlyWorkingWith : undefined,
      targetRole: userType === 'professional' ? targetRole : undefined,
      languagesKnown: languagesKnown || [],
    });

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
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error detail:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
