import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  completedAt: { type: Date },
  dueTime: { type: String },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
