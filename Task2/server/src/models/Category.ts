import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  userId: Types.ObjectId;
  name: string;
  color: string;
  icon: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: 'folder' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.index({ userId: 1, name: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
