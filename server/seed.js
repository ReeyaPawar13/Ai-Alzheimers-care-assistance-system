import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import User from './models/User.js';
import PatientProfile from './models/PatientProfile.js';
import CaregiverProfile from './models/CaregiverProfile.js';
import DoctorProfile from './models/DoctorProfile.js';
import Medicine from './models/Medicine.js';
import Schedule from './models/Schedule.js';
import Task from './models/Task.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);

  console.log('Connected to DB');

  // Clean up existing
  await User.deleteMany({});
  await PatientProfile.deleteMany({});
  await CaregiverProfile.deleteMany({});
  await DoctorProfile.deleteMany({});
  await Medicine.deleteMany({});
  await Schedule.deleteMany({});
  await Task.deleteMany({});

  const salt = await bcrypt.genSalt(10);

  const patientPassword = await bcrypt.hash('Patient@123', salt);
  const caregiverPassword = await bcrypt.hash('Caregiver@123', salt);
  const doctorPassword = await bcrypt.hash('Doctor@123', salt);

  // Create Patient User
  const patientUser = new User({
    name: 'Reeya Patel',
    age: 68,
    gender: 'Female',
    email: 'patient@demo.com',
    phone: '9876543210',
    password: patientPassword,
    role: 'patient',
  });
  await patientUser.save();

  const caregiverUser = new User({
    name: 'Rajesh Patel',
    age: 45,
    gender: 'Male',
    email: 'caregiver@demo.com',
    phone: '9876501234',
    password: caregiverPassword,
    role: 'caregiver',
  });
  await caregiverUser.save();

  const doctorUser = new User({
    name: 'Dr. Asha Joshi',
    age: 50,
    gender: 'Female',
    email: 'doctor@demo.com',
    phone: '9876509876',
    password: doctorPassword,
    role: 'doctor',
  });
  await doctorUser.save();

  // Patient Profile linked with caregiver
  const patientProfile = new PatientProfile({
    user: patientUser._id,
    caregiverName: caregiverUser.name,
    emergencyContact: '9876501234',
    address: '123 Nashik, Maharashtra, India',
    dateOfBirth: new Date('1958-04-15'),
    caregiver: caregiverUser._id,
    doctor: doctorUser._id,
  });
  await patientProfile.save();

  // Caregiver Profile linked with patient
  const caregiverProfile = new CaregiverProfile({
    user: caregiverUser._id,
    relationshipWithPatient: 'Son',
    patientName: patientUser.name,
    patient: patientUser._id,
    emergencyContact: '9876543210',
  });
  await caregiverProfile.save();

  // Doctor Profile
  const doctorProfile = new DoctorProfile({
    user: doctorUser._id,
    medicalDegree: 'MD Neurology',
    specialization: 'Neurology',
    clinicName: 'Nashik Neurology Clinic',
    yearsOfExperience: 25,
    medicalRegistrationNumber: 'MD123456789',
  });
  await doctorProfile.save();

  // Seed Medicines
  const medicinesData = [
    { name: 'Donepezil', dosage: '1 tablet', time: '09:00 AM', instructions: 'After breakfast' },
    { name: 'Memantine', dosage: '10mg', time: '09:00 PM', instructions: 'Before sleep' },
  ];

  for (const med of medicinesData) {
    await new Medicine({
      patient: patientUser._id,
      name: med.name,
      dosage: med.dosage,
      time: med.time,
      instructions: med.instructions,
      status: 'pending',
    }).save();
  }

  // Seed Schedule
  const scheduleData = [
    { time: '07:00 AM', activity: 'Wake Up' },
    { time: '08:00 AM', activity: 'Exercise' },
    { time: '09:00 AM', activity: 'Breakfast' },
    { time: '10:00 AM', activity: 'Medicine' },
  ];

  for (const sched of scheduleData) {
    await new Schedule({
      patient: patientUser._id,
      time: sched.time,
      activity: sched.activity,
    }).save();
  }

  // Seed Tasks
  const tasksData = [
    'Take morning medicine',
    'Eat breakfast',
    'Exercise',
    'Drink water',
    'Take evening medicine',
  ];

  for (const title of tasksData) {
    await new Task({
      patient: patientUser._id,
      title,
      status: 'pending',
    }).save();
  }

  console.log('Seed Completed');
  mongoose.connection.close();
}

seed().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
