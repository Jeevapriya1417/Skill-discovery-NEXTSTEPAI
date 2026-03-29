import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/assemblyai';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const { audioUrl } = await req.json();

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Convert relative URL to absolute file path
    const fullPath = join(process.cwd(), 'public', audioUrl);
    
    // Transcribe using AssemblyAI
    const result = await transcribeAudio(fullPath);

    return NextResponse.json(
      { 
        message: 'Transcription completed',
        transcript: result.transcript,
        words: result.words,
        confidence: result.confidence 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Transcription error detail:', error);
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    );
  }
}
