import mongoose, { Document, Schema } from 'mongoose';

export enum ContentType {
  NOTES = 'notes',
  ASSIGNMENTS = 'assignments',
  PYQS = 'pyqs',
  EVENTS = 'events',
  JOBS = 'jobs',
  OTHER = 'other'
}

export interface IContent extends Document {
  title: string;
  description: string;
  type: ContentType;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  branch: string;
  semester: number;
  subject: string;
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  downloads: number;
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: Object.values(ContentType), required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    branch: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    subject: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

contentSchema.index({ title: 'text', description: 'text', tags: 'text' });
contentSchema.index({ type: 1, branch: 1, semester: 1, subject: 1 });
contentSchema.index({ uploadedBy: 1 });
contentSchema.index({ createdAt: -1 });

export const Content = mongoose.model<IContent>('Content', contentSchema);
