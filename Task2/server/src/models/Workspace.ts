import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  ownerId: Types.ObjectId;
  members: {
    userId: Types.ObjectId;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
  }[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>({
  name: { type: String, required: true, trim: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  inviteCode: { type: String, required: true, unique: true },
}, { timestamps: true });

workspaceSchema.index({ 'members.userId': 1 });

export const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);
