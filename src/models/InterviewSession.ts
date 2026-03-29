import mongoose, { Schema, Document } from 'mongoose';

export interface IVocalMetrics {
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

export interface IContentScores {
  relevanceScore: number;
  clarityScore: number;
  depthScore: number;
  correctnessScore?: number; // For coding
  practicalityScore?: number; // For situational
  contentFeedback: string;
}

export interface IQuestionResponse {
  question: string;
  transcript: string;
  code?: string;
  vocalMetrics: IVocalMetrics;
  contentScore: IContentScores;
}

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  domain: mongoose.Schema.Types.Mixed; // Can be string or object
  status: 'in-progress' | 'completed';
  currentSection: 1 | 2 | 3 | 4;
  currentQuestionIndex: number; // For section 2 and 3
  
  section1: {
    transcript: string;
    vocalMetrics: IVocalMetrics;
    score: number;
  };
  
  section2: IQuestionResponse[]; // 10 questions
  
  section3: {
    sectionType: '3A' | '3B'; // 3A=Coding, 3B=Non-coding
    questions: IQuestionResponse[]; // 2 questions
  };

  section4: {
    topic: string;
    transcript: string;
    vocalMetrics: IVocalMetrics;
    score: number;
  };
  
  finalReport: {
    overallConfidenceScore: number;
    technicalScore: number;
    problemSolvingScore: number;
    vocalSummary: {
      averageFillerWords: number;
      averageWPM: number;
      clarity: string;
    };
    contentSummary: {
      relevance: number;
      clarity: number;
      depth: number;
    };
    sectionBreakdown: {
      section1: number;
      section2: number;
      section3: number;
      section4: number;
    };
    personalizedTips: string[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const VocalMetricsSchema = new Schema<IVocalMetrics>({
  fillerWordCount: {
    um: { type: Number, default: 0 },
    uh: { type: Number, default: 0 },
    ah: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    youKnow: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  speakingPace: {
    wordsPerMinute: { type: Number, default: 0 },
    evaluation: { type: String, enum: ['Too Slow', 'Optimal', 'Too Fast'], default: 'Optimal' },
  },
  pauseAnalysis: {
    longPausesCount: { type: Number, default: 0 },
    averagePauseDuration: { type: Number, default: 0 },
  },
  responseDurationSeconds: { type: Number, default: 0 },
});

const ContentScoresSchema = new Schema<IContentScores>({
  relevanceScore: { type: Number, default: 0 },
  clarityScore: { type: Number, default: 0 },
  depthScore: { type: Number, default: 0 },
  correctnessScore: { type: Number },
  practicalityScore: { type: Number },
  contentFeedback: { type: String, default: '' },
});

const QuestionResponseSchema = new Schema<IQuestionResponse>({
  question: { type: String, required: true },
  transcript: { type: String, default: '' },
  code: { type: String },
  vocalMetrics: { type: VocalMetricsSchema },
  contentScore: { type: ContentScoresSchema },
});

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domain: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    currentSection: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    section1: {
      transcript: { type: String, default: '' },
      vocalMetrics: { type: VocalMetricsSchema },
      score: { type: Number, default: 0 },
    },
    section2: {
      type: [QuestionResponseSchema],
      default: [],
    },
    section3: {
      sectionType: { type: String, enum: ['3A', '3B'] },
      questions: { type: [QuestionResponseSchema], default: [] },
    },
    section4: {
      topic: { type: String, default: '' },
      transcript: { type: String, default: '' },
      vocalMetrics: { type: VocalMetricsSchema },
      score: { type: Number, default: 0 },
    },
    finalReport: {
      overallConfidenceScore: { type: Number, default: 0 }, // vocal_confidence_score_percentage
      technicalScore: { type: Number, default: 0 },
      problemSolvingScore: { type: Number, default: 0 },
      vocalSummary: {
        averageFillerWords: { type: Number, default: 0 },
        averageWPM: { type: Number, default: 0 },
        clarity: { type: String, default: '' },
      },
      contentSummary: {
        relevance: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
        depth: { type: Number, default: 0 },
      },
      sectionBreakdown: {
        section1: { type: Number, default: 0 },
        section2: { type: Number, default: 0 },
        section3: { type: Number, default: 0 },
        section4: { type: Number, default: 0 },
      },
      personalizedTips: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.InterviewSession || mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
