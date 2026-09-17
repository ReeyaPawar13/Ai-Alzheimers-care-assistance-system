import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: String, required: true },
  activity: { type: String, required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);
