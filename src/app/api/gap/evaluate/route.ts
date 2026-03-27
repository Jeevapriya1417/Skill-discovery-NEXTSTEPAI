import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { askGemini, sanitizeJsonResponse } from '@/lib/gemini';
import Assessment from '@/models/Assessment';
import User from '@/models/User';
import GapAnalysis from '@/models/GapAnalysis';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { assessmentId, userAnswers } = await req.json();

    if (!assessmentId || !userAnswers) {
      return NextResponse.json(
        { error: 'Assessment ID and answers are required' },
        { status: 400 }
      );
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Calculate scores (only current role is tested now)
    let currentRoleCorrect = 0;
    let currentRoleMcqTotal = 0;
    
    const assessmentDetails = assessment.questions.map((q: any, i: number) => {
      const isMcq = q.type === 'mcq';
      const isCorrect = isMcq ? userAnswers[i] === q.correctAnswer : 'AI to evaluate';
      
      if (q.tag === 'current') {
        if (isMcq) {
          currentRoleMcqTotal++;
          if (userAnswers[i] === q.correctAnswer) currentRoleCorrect++;
        }
      }

      return {
        question: q.question,
        type: q.type,
        tag: q.tag,
        userAnswer: userAnswers[i],
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    const currentRoleScore = currentRoleMcqTotal > 0 ? Math.round((currentRoleCorrect / currentRoleMcqTotal) * 100) : 50;
    const targetRoleScore = 0; // Target role is not tested, so score is 0 or N/A

    // Get user for context
    const user = await User.findById(assessment.userId);
    const currentRole = user?.currentRole;
    const targetRole = user?.targetRole;

    // Get AI gap analysis
    const prompt = `You are a career consultant for a professional transitioning from ${currentRole} to ${targetRole}.
Evaluate their performance on a proficiency test for their CURRENT role (${currentRole}). They were NOT tested on the target role yet.

Test Results (${currentRole}):
${assessmentDetails.map((d: any, i: number) => `
Question ${i + 1} (Tag: ${d.tag}, Type: ${d.type}): ${d.question}
User's Answer: ${d.userAnswer}
${d.type === 'mcq' ? `Correct Answer: ${d.correctAnswer}` : 'This is a coding problem, evaluate the logic and depth of knowledge.'}
`).join('\n')}

Based on their CURRENT ROLE test results (score: ${currentRoleScore}%) and the fact that they are pivoting to ${targetRole}:
1. Identify high-value transferable skills they possess from their current role.
2. Identify specific skill gaps they WILL need to learn for the new ${targetRole} role. Base this on what a typical ${currentRole} lacks compared to a ${targetRole}.
3. Assign severity to each gap (Low, Medium, High).
4. Calculate a realistic Readiness Percentage (0-100) for starting learning/transitioning, based on their baseline technical foundations.

Return as valid JSON with this structure:
{
  "transferableSkills": ["..."],
  "skillGaps": [
    { "skill": "...", "severity": "..." }
  ],
  "readinessPercentage": 0,
  "results": [
    {
      "question": "...",
      "type": "mcq/coding",
      "userAnswer": "...",
      "correctAnswer": "...",
      "sampleSolution": "...",
      "isCorrect": true/false/"AI evaluated",
      "feedback": "..."
    }
  ]
}

Only return the JSON, nothing else.`;

    const aiResponse = await askGemini(prompt);
    const cleanedResponse = sanitizeJsonResponse(aiResponse);
    
    let gapAnalysis;
    try {
      gapAnalysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      gapAnalysis = {
        transferableSkills: ['Problem-solving', 'Communication'],
        skillGaps: [{ skill: 'Target role fundamentals', severity: 'High' }],
        readinessPercentage: 30,
      };
    }

    // Update assessment
    assessment.answers = userAnswers;
    assessment.scores = { 
      total: currentRoleScore, // Only storing current role score now
      currentRoleScore,
      targetRoleScore: 0
    };
    assessment.results = gapAnalysis.results || [];
    await assessment.save();

    // Save gap analysis
    await GapAnalysis.create({
      userId: assessment.userId,
      currentRole: currentRole || '',
      targetRole: targetRole || '',
      transferableSkills: gapAnalysis.transferableSkills || [],
      skillGaps: gapAnalysis.skillGaps || [],
      readinessPercentage: gapAnalysis.readinessPercentage || 0,
    });

    return NextResponse.json(
      {
        message: 'Gap analysis completed',
        currentRoleScore,
        targetRoleScore,
        transferableSkills: gapAnalysis.transferableSkills || [],
        skillGaps: gapAnalysis.skillGaps || [],
        readinessPercentage: gapAnalysis.readinessPercentage || 0,
        results: assessment.results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gap evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
