import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  type?: 'mcq' | 'coding';
  options?: string[];
  correctAnswer?: string;
  tag?: string;
}

export interface IAssessmentResult {
  question: string;
  type: 'mcq' | 'coding';
  userAnswer: string;
  correctAnswer?: string;
  sampleSolution?: string;
  isCorrect?: boolean | string;
  feedback: string;
}

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  questions: IQuestion[];
  answers: string[];
  results: IAssessmentResult[];
  scores: {
    total: number;
    currentRoleScore?: number;
    targetRoleScore?: number;
  };
  evaluatedLevel: string;
  strengths: string[];
  weaknesses: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'coding'], default: 'mcq' },
  options: { type: [String], required: false },
  correctAnswer: { type: String, required: false },
  tag: { type: String },
});

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      required: true,
    },
    answers: {
      type: [String],
      default: [],
    },
    scores: {
      total: { type: Number, default: 0 },
      currentRoleScore: { type: Number },
      targetRoleScore: { type: Number },
    },
    evaluatedLevel: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    results: [{
      question: String,
      type: { type: String, enum: ['mcq', 'coding'] },
      userAnswer: String,
      correctAnswer: String,
      sampleSolution: String,
      isCorrect: Schema.Types.Mixed,
      feedback: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
