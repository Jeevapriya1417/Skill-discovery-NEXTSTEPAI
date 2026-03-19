import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillGap {
  skill: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface IGapAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  currentRole: string;
  targetRole: string;
  transferableSkills: string[];
  skillGaps: ISkillGap[];
  readinessPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillGapSchema = new Schema<ISkillGap>({
  skill: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
});

const GapAnalysisSchema = new Schema<IGapAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentRole: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    transferableSkills: {
      type: [String],
      default: [],
    },
    skillGaps: {
      type: [SkillGapSchema],
      default: [],
    },
    readinessPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.GapAnalysis || mongoose.model<IGapAnalysis>('GapAnalysis', GapAnalysisSchema);
