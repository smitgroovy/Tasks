import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  color: string;
  createdAt: Date;
}

const tagSchema = new Schema<ITag>({
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#10b981' },
}, { timestamps: false, createdAt: true });

tagSchema.index({ name: 1 }, { unique: true });

export const Tag = mongoose.model<ITag>('Tag', tagSchema);
