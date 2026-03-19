import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  tag?: string;
}

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  questions: IQuestion[];
  answers: string[];
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
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
