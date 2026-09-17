import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicalDegree: { type: String, required: true },
  specialization: { type: String, required: true },
  clinicName: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true },
  medicalRegistrationNumber: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('DoctorProfile', doctorProfileSchema);
