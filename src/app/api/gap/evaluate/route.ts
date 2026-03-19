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

    // Calculate scores
    let currentRoleCorrect = 0;
    let targetRoleCorrect = 0;
    let currentRoleTotal = 0;
    let targetRoleTotal = 0;
    const wrongTargetQuestions: any[] = [];

    assessment.questions.forEach((q: any, index: number) => {
      if (q.tag === 'current') {
        currentRoleTotal++;
        if (userAnswers[index] === q.correctAnswer) {
          currentRoleCorrect++;
        }
      } else {
        targetRoleTotal++;
        if (userAnswers[index] === q.correctAnswer) {
          targetRoleCorrect++;
        } else {
          wrongTargetQuestions.push(q.question);
        }
      }
    });

    const currentRoleScore = Math.round((currentRoleCorrect / currentRoleTotal) * 100) || 0;
    const targetRoleScore = Math.round((targetRoleCorrect / targetRoleTotal) * 100) || 0;

    // Get user for context
    const user = await User.findById(assessment.userId);
    const currentRole = user?.currentRole;
    const targetRole = user?.targetRole;

    // Get AI gap analysis
    const prompt = `A ${currentRole} professional scored ${currentRoleScore}% on current role questions and ${targetRoleScore}% on ${targetRole} questions.

Target role questions they got wrong:
${wrongTargetQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Based on this analysis:
1. Identify which skills from their current role are transferable to ${targetRole}
2. Identify the specific skill gaps they need to fill
3. Assign a severity level (Low, Medium, High) to each skill gap
4. Calculate a readiness percentage (0-100) for the transition

Return as valid JSON with this structure:
{
  "transferableSkills": ["skill 1", "skill 2", ...],
  "skillGaps": [
    { "skill": "skill name", "severity": "Low/Medium/High" },
    ...
  ],
  "readinessPercentage": number
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
      total: Math.round((currentRoleScore + targetRoleScore) / 2),
      currentRoleScore,
      targetRoleScore 
    };
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
