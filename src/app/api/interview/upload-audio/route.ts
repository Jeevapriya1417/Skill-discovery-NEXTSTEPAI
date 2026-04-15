import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const userId = authSession.user.id;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${userId}_${timestamp}_${randomString}.webm`;
    const filepath = join(uploadsDir, filename);

    // Convert File to Buffer and save
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const audioUrl = `/uploads/${filename}`;

    return NextResponse.json(
      { 
        message: 'Audio uploaded successfully',
        audioUrl,
        filename 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    );
  }
}
