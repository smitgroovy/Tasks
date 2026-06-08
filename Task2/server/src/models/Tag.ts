import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITag extends Document {
  userId: Types.ObjectId;
  name: string;
  color: string;
  createdAt: Date;
}

const tagSchema = new Schema<ITag>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#10b981' },
}, { timestamps: false, createdAt: true });

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Tag = mongoose.model<ITag>('Tag', tagSchema);
