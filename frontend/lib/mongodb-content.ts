import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContent extends Document {
  title: string;
  description: string;
  type: 'notes' | 'assignments' | 'pyqs' | 'events' | 'jobs' | 'other';
  fileUrl: string;
  fileType: string;
  fileSize: number;
  branch: string;
  semester: number;
  subject: string;
  tags: string[];
  uploadedBy: string;
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
    type: { 
      type: String, 
      enum: ['notes', 'assignments', 'pyqs', 'events', 'jobs', 'other'], 
      required: true 
    },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    branch: { type: String, required: true },
    semester: { type: Number, default: 0 },
    subject: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    uploadedBy: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

contentSchema.index({ title: 'text', description: 'text', tags: 'text' });
contentSchema.index({ type: 1, branch: 1, semester: 1, subject: 1 });

export const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', contentSchema);
