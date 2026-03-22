import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: string;
  description?: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    description: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ type: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
