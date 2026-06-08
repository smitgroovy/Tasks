import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: null },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  refreshToken: { type: String, select: false },
}, { timestamps: true });

userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
