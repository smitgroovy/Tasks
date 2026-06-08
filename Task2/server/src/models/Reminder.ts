import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReminder extends Document {
  taskId: Types.ObjectId;
  type: 'due_date' | 'custom';
  scheduledAt: Date;
  sent: boolean;
  createdAt: Date;
}

const reminderSchema = new Schema<IReminder>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  type: { type: String, enum: ['due_date', 'custom'], default: 'due_date' },
  scheduledAt: { type: Date, required: true },
  sent: { type: Boolean, default: false },
}, { timestamps: false, createdAt: true });

reminderSchema.index({ scheduledAt: 1, sent: 1 });

export const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);
