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
  contentFeedback: string;
}

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  questions: string[];
  transcripts: string[];
  vocalMetrics: IVocalMetrics[];
  contentScores: IContentScores[];
  overallConfidence: number;
  feedback: {
    vocalFeedback: string;
    contentFeedback: string;
    improvementTips: string[];
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
  contentFeedback: { type: String, default: '' },
});

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    questions: {
      type: [String],
      required: true,
    },
    transcripts: {
      type: [String],
      default: [],
    },
    vocalMetrics: {
      type: [VocalMetricsSchema],
      default: [],
    },
    contentScores: {
      type: [ContentScoresSchema],
      default: [],
    },
    overallConfidence: {
      type: Number,
      default: 0,
    },
    feedback: {
      vocalFeedback: { type: String, default: '' },
      contentFeedback: { type: String, default: '' },
      improvementTips: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.InterviewSession || mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
