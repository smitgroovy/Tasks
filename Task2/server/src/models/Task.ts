import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  workspaceId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: Date;
  completedAt?: Date;
  parentId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  order: number;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
    lastGenerated?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 2000 },
  priority: { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  parentId: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  order: { type: Number, default: 0 },
  recurrence: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'custom'],
      default: 'none',
    },
    interval: { type: Number, default: 1 },
    daysOfWeek: [{ type: Number }],
    endDate: { type: Date },
    lastGenerated: { type: Date },
  },
}, { timestamps: true });

taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ categoryId: 1 });
taskSchema.index({ parentId: 1 });
taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITask>('Task', taskSchema);
