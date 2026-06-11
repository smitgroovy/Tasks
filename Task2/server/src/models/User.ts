import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'editor' | 'user';
  avatar?: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  isActive: boolean;
  emailVerified: boolean;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'editor', 'user'],
    default: 'user',
  },
  avatar: { type: String, default: null },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  timezone: { type: String, default: 'UTC' },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  refreshToken: { type: String, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
