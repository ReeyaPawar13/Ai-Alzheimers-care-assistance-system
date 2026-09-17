import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  time: { type: String, required: true },
  instructions: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'done'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);
