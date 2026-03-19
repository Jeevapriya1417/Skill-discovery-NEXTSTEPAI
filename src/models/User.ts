import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  userType: 'student' | 'professional';
  collegeName?: string;
  yearOfStudy?: string;
  selfRatedSkillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  currentRole?: string;
  yearsOfExperience?: number;
  technologiesCurrentlyWorkingWith?: string[];
  targetRole?: string;
  languagesKnown: string[];
  selectedDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    userType: {
      type: String,
      enum: ['student', 'professional'],
      required: [true, 'User type is required'],
    },
    collegeName: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: String,
      trim: true,
    },
    selfRatedSkillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      trim: true,
    },
    currentRole: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    technologiesCurrentlyWorkingWith: {
      type: [String],
      default: [],
    },
    targetRole: {
      type: String,
      trim: true,
    },
    languagesKnown: {
      type: [String],
      default: [],
    },
    selectedDomain: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
