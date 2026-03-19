import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  sessionHistory: mongoose.Types.ObjectId[];
  fillerTrend: 'Decreasing' | 'Stable' | 'Increasing';
  paceTrend: 'Improving' | 'Stable' | 'Needs Work';
  confidenceTrend: number;
  totalSessions: number;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    sessionHistory: {
      type: [Schema.Types.ObjectId],
      ref: 'InterviewSession',
      default: [],
    },
    fillerTrend: {
      type: String,
      enum: ['Decreasing', 'Stable', 'Increasing'],
      default: 'Stable',
    },
    paceTrend: {
      type: String,
      enum: ['Improving', 'Stable', 'Needs Work'],
      default: 'Stable',
    },
    confidenceTrend: {
      type: Number,
      default: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
