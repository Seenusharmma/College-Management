import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  clerkUserId: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'super_admin' | 'admin';
  branch?: string;
  semester?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkUserId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    role: { 
      type: String, 
      enum: ['student', 'teacher', 'admin', 'super_admin'], 
      default: 'student' 
    },
    branch: { type: String },
    semester: { type: Number },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
