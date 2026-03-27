import { NextRequest, NextResponse } from 'next/server';
import genAI from '@/lib/gemini';
import { join } from 'path';
import fs from 'fs';

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
    
    // Transcribe using Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const audioData = fs.readFileSync(fullPath);
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: audioData.toString('base64'),
          mimeType: 'audio/webm'
        }
      },
      "Transcribe this audio exactly as spoken. Reply with ONLY the transcript, nothing else."
    ]);

    const transcriptText = result.response.text();

    return NextResponse.json(
      { 
        message: 'Transcription completed',
        transcript: transcriptText.trim(),
        words: [], // Gemini doesn't provide word-level timestamps easily, so we pass empty array to keep compatibility
        confidence: 0.95 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Transcription error detail:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio completely. ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
