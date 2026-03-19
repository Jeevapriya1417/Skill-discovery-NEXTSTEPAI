import mongoose from 'mongoose';
import connectDB from './src/lib/mongodb';
import User from './src/models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function test() {
  try {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected!');

    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`Creating user with email: ${testEmail}`);

    const user = await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'password123',
      userType: 'student',
      collegeName: 'Test College',
      yearOfStudy: '3rd Year',
      selfRatedSkillLevel: 'Beginner',
      languagesKnown: ['JavaScript'],
    });

    console.log('User created:', user);
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
