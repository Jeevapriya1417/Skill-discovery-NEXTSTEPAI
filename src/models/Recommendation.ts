import mongoose, { Schema, Document } from 'mongoose';

export interface ISuggestedDomain {
  domain: string;
  matchReason: string;
}

export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  suggestedDomains: ISuggestedDomain[];
  matchReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SuggestedDomainSchema = new Schema<ISuggestedDomain>({
  domain: { type: String, required: true },
  matchReason: { type: String, required: true },
});

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    suggestedDomains: {
      type: [SuggestedDomainSchema],
      required: true,
    },
    matchReasons: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Recommendation || mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
