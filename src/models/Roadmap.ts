import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmapStage {
  stage: number;
  topic: string;
  estimatedDuration: string;
  learningLinks?: { title: string; url: string }[];
}

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'discovery' | 'gap';
  domain: string;
  alreadyCovered: string[];
  toLearn: IRoadmapStage[];
  totalEstimatedTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapStageSchema = new Schema<IRoadmapStage>({
  stage: { type: Number, required: true },
  topic: { type: String, required: true },
  estimatedDuration: { type: String, required: true },
  learningLinks: [{
    title: { type: String },
    url: { type: String }
  }]
});

const RoadmapSchema = new Schema<IRoadmap>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['discovery', 'gap'],
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    alreadyCovered: {
      type: [String],
      default: [],
    },
    toLearn: {
      type: [RoadmapStageSchema],
      default: [],
    },
    totalEstimatedTime: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
