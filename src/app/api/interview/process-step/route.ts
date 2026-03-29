import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { transcribeAudio } from '@/lib/assemblyai';
import InterviewSession from '@/models/InterviewSession';
import path from 'path';

function calculateVocalMetrics(transcript: string, durationSeconds: number) {
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  const fillerCounts: any = { um: 0, uh: 0, ah: 0, like: 0, youKnow: 0 };
  let totalFillers = 0;

  words.forEach(word => {
    if (['um', 'uh', 'ah', 'like'].includes(word)) {
      fillerCounts[word]++;
      totalFillers++;
    }
  });

  // Check for "you know" as a special case
  const youKnowCount = (transcript.toLowerCase().match(/you know/g) || []).length;
  fillerCounts.youKnow = youKnowCount;
  totalFillers += youKnowCount;

  const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;
  let paceEval: 'Too Slow' | 'Optimal' | 'Too Fast' = 'Optimal';
  if (wpm < 110) paceEval = 'Too Slow';
  else if (wpm > 170) paceEval = 'Too Fast';

  // Calculate a base score penalizing silence/low word count
  let calculatedScore = Math.max(0, 100 - totalFillers * 5);
  if (durationSeconds > 15) {
    if (wordCount < 5) calculatedScore = 0;
    else if (wpm < 50) calculatedScore *= 0.4;
    else if (wpm < 80) calculatedScore *= 0.7;
  } else if (durationSeconds > 5 && wordCount < 2) {
    calculatedScore = 0;
  }

  return {
    fillerWordCount: { ...fillerCounts, total: totalFillers },
    speakingPace: { wordsPerMinute: wpm, evaluation: paceEval },
    pauseAnalysis: { longPausesCount: 0, averagePauseDuration: 0 }, // Placeholder
    responseDurationSeconds: durationSeconds,
    score: Math.round(calculatedScore)
  };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { sessionId, audioUrl, section, questionIndex, durationSeconds, code } = await req.json();

    if (!sessionId || (!audioUrl && !code) || !section) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 1. Transcription (Immediate)
    let transcript = "";

    if (audioUrl) {
      // Use AssemblyAI for efficient per-question transcription
      // Convert relative URL to absolute file path
      const fullPath = path.join(process.cwd(), 'public', audioUrl);
      const result = await transcribeAudio(fullPath);
      transcript = result.transcript || "";
    } else if (code) {
      transcript = code; // For coding sections where no audio is provided
    }

    // 2. Vocal Analysis (Local - No API call)
    const vocalMetrics = calculateVocalMetrics(transcript, durationSeconds);

    // 3. Update MongoDB (Save transcript and metrics, leave AI evaluation for the final step)
    if (section === 1) {
      session.section1 = {
        transcript,
        vocalMetrics,
        score: vocalMetrics.score
      };
      session.currentSection = 2;
      session.currentQuestionIndex = 0;
    } else if (section === 2) {
      session.section2[questionIndex].transcript = transcript;
      session.section2[questionIndex].vocalMetrics = vocalMetrics;
      // We explicitly leave session.section2[questionIndex].contentScore empty as requested
      
      if (questionIndex < session.section2.length - 1) {
        session.currentQuestionIndex = questionIndex + 1;
      } else {
        session.currentSection = 3;
        session.currentQuestionIndex = 0;
      }
    } else if (section === 3) {
      session.section3.questions[questionIndex].transcript = transcript;
      session.section3.questions[questionIndex].code = code;
      session.section3.questions[questionIndex].vocalMetrics = vocalMetrics;
      
      if (questionIndex < session.section3.questions.length - 1) {
        session.currentQuestionIndex = questionIndex + 1;
      } else {
        session.currentSection = 4;
        session.currentQuestionIndex = 0;
      }
    } else if (section === 4) {
      session.section4 = {
        topic: session.section4.topic,
        transcript,
        vocalMetrics,
        score: vocalMetrics.score
      };
      session.status = 'completed';
    }

    await session.save();

    return NextResponse.json({ 
      message: 'Step processed successfully (Bulk analysis scheduled)',
      nextSection: session.currentSection,
      nextIndex: session.currentQuestionIndex,
      status: session.status,
      session
    });

  } catch (error: any) {
    console.error('Process step error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error?.message || 'Unknown'}` },
      { status: 500 }
    );
  }
}
