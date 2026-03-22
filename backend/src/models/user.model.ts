import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  SUPER_ADMIN = 'super_admin'
}

export interface IUser extends Document {
  clerkUserId: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  branch?: string;
  semester?: number;
  bookmarks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkUserId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.STUDENT },
    branch: { type: String },
    semester: { type: Number, min: 1, max: 8 },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Content' }]
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ branch: 1, semester: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
