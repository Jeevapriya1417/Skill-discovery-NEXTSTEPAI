import { AssemblyAI } from 'assemblyai';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY!;

if (!ASSEMBLYAI_API_KEY) {
  throw new Error('Please define the ASSEMBLYAI_API_KEY environment variable');
}

const assemblyClient = new AssemblyAI({
  apiKey: ASSEMBLYAI_API_KEY,
});

export interface TranscriptionResult {
  transcript: string;
  words: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  confidence: number;
}

export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  try {
    const transcript = await assemblyClient.transcripts.transcribe({
      audio: audioUrl,
      word_boost: [],
      format_text: true,
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error);
    }

    return {
      transcript: transcript.text || '',
      words: transcript.words?.map(word => ({
        text: word.text,
        start: word.start,
        end: word.end,
        confidence: word.confidence,
      })) || [],
      confidence: transcript.confidence || 0,
    };
  } catch (error) {
    console.error('AssemblyAI transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export default assemblyClient;
