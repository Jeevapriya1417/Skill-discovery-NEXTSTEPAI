import { NextRequest, NextResponse } from 'next/server';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';

// Filler words to track
const FILLER_WORDS = ['um', 'uh', 'ah', 'like', 'you know'];

interface VocalMetrics {
  fillerWordCount: {
    um: number;
    uh: number;
    ah: number;
    like: number;
    youKnow: number;
    total: number;
  };
  speakingPace: {
    wordsPerMinute: number;
    evaluation: 'Too Slow' | 'Optimal' | 'Too Fast';
  };
  pauseAnalysis: {
    longPausesCount: number;
    averagePauseDuration: number;
  };
  responseDurationSeconds: number;
}

function analyzeVocalMetrics(transcript: string, words: any[], durationSeconds: number): VocalMetrics {
  const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
  const wordsPerMinute = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

  // Count filler words
  const lowerTranscript = transcript.toLowerCase();
  const fillerCounts = {
    um: (lowerTranscript.match(/\bum\b/g) || []).length,
    uh: (lowerTranscript.match(/\buh\b/g) || []).length,
    ah: (lowerTranscript.match(/\bah\b/g) || []).length,
    like: (lowerTranscript.match(/\blike\b/g) || []).length,
    youKnow: (lowerTranscript.match(/\byou know\b/g) || []).length,
  };

  // Analyze pauses from word timestamps
  let longPausesCount = 0;
  let totalPauseDuration = 0;
  
  for (let i = 1; i < words.length; i++) {
    const pauseDuration = (words[i].start - words[i - 1].end) / 1000; // Convert to seconds
    if (pauseDuration > 1.5) {
      longPausesCount++;
      totalPauseDuration += pauseDuration;
    }
  }

  const averagePauseDuration = longPausesCount > 0 ? totalPauseDuration / longPausesCount : 0;

  // Evaluate speaking pace
  let paceEvaluation: 'Too Slow' | 'Optimal' | 'Too Fast' = 'Optimal';
  if (wordsPerMinute < 100) paceEvaluation = 'Too Slow';
  else if (wordsPerMinute > 160) paceEvaluation = 'Too Fast';

  return {
    fillerWordCount: {
      ...fillerCounts,
      total: Object.values(fillerCounts).reduce((a, b) => a + b, 0),
    },
    speakingPace: {
      wordsPerMinute,
      evaluation: paceEvaluation,
    },
    pauseAnalysis: {
      longPausesCount,
      averagePauseDuration: Math.round(averagePauseDuration * 10) / 10,
    },
    responseDurationSeconds: Math.round(durationSeconds),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, words, question, durationSeconds } = await req.json();

    if (!transcript || !question) {
      return NextResponse.json(
        { error: 'Transcript and question are required' },
        { status: 400 }
      );
    }

    // Analyze vocal metrics
    const vocalMetrics = analyzeVocalMetrics(transcript, words || [], durationSeconds || 30);

    // Get AI content evaluation
    const prompt = `Evaluate the following interview response:

Question: "${question}"

Candidate's Answer: "${transcript}"

Provide an evaluation with:
1. Relevance score (0-100) - how well the answer addresses the question
2. Clarity score (0-100) - how clearly the idea was communicated
3. Depth score (0-100) - how thoroughly the topic was covered
4. Specific feedback on what to include or improve

Return as valid JSON:
{
  "relevanceScore": number,
  "clarityScore": number,
  "depthScore": number,
  "contentFeedback": "specific suggestions"
}

Only return the JSON, nothing else.`;

    const aiResponse = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(aiResponse);
    
    let contentScores;
    try {
      contentScores = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      contentScores = {
        relevanceScore: 70,
        clarityScore: 70,
        depthScore: 70,
        contentFeedback: 'Good attempt. Try to be more specific and provide examples.',
      };
    }

    return NextResponse.json(
      { 
        message: 'Analysis completed',
        vocalMetrics,
        contentScores: {
          relevanceScore: contentScores.relevanceScore || 70,
          clarityScore: contentScores.clarityScore || 70,
          depthScore: contentScores.depthScore || 70,
          contentFeedback: contentScores.contentFeedback || 'Good attempt.',
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze response' },
      { status: 500 }
    );
  }
}
