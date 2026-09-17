import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caregiverName: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to caregiver user
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to doctor user (optional initially)
}, { timestamps: true });

export default mongoose.model('PatientProfile', patientProfileSchema);
