import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';

const saltRounds = 10;

// ===============================
// REGISTER
// ===============================
export const register = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      email,
      phone,
      password,
      role,

      // Patient
      caregiverName,
      emergencyContact,
      address,
      dateOfBirth,

      // Caregiver
      relationshipWithPatient,
      patientName,
      patientId,
      patientEmail,
      caregiverEmergencyContact,

      // Doctor
      medicalDegree,
      specialization,
      clinicName,
      yearsOfExperience,
      medicalRegistrationNumber,
    } = req.body;

    // ===============================
    // REQUIRED COMMON FIELDS
    // ===============================

    if (
      !name ||
      age === undefined ||
      age === null ||
      age === '' ||
      !gender ||
      !email ||
      !phone ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    // ===============================
    // VALIDATE AGE
    // ===============================

    const numericAge = Number(age);

    if (
      !Number.isFinite(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      return res.status(400).json({
        message: 'Please enter a valid age',
      });
    }

    // ===============================
    // VALIDATE ROLE
    // ===============================

    if (!['patient', 'caregiver', 'doctor'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid user role',
      });
    }

    // ===============================
    // VALIDATE GENDER
    // ===============================

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({
        message: 'Invalid gender',
      });
    }

    // ===============================
    // CHECK EXISTING USER
    // ===============================

    const existingUser = await User.findOne({
      $or: [
        {
          email: normalizedEmail,
        },
        {
          phone: normalizedPhone,
        },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email or phone already registered',
      });
    }

    // ===============================
    // HASH PASSWORD
    // ===============================

    const hashedPassword = await bcrypt.hash(
      password,
      saltRounds
    );

    // ===============================
    // CREATE USER
    // ===============================

    const user = new User({
      name: name.trim(),
      age: numericAge,
      gender,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role,
      profileImage: '',
    });

    await user.save();

    // ===============================
    // PATIENT PROFILE
    // ===============================

    if (role === 'patient') {
      if (
        !caregiverName ||
        !emergencyContact ||
        !address ||
        !dateOfBirth
      ) {
        return res.status(400).json({
          message: 'Missing patient additional fields',
        });
      }

      const caregiverUser = await User.findOne({
        name: caregiverName,
        role: 'caregiver',
      });

      const caregiverId = caregiverUser
        ? caregiverUser._id
        : null;

      const patientProfile = new PatientProfile({
        user: user._id,
        caregiverName,
        emergencyContact,
        address,
        dateOfBirth,
        caregiver: caregiverId,
        doctor: null,
      });

      await patientProfile.save();
    }

    // ===============================
    // CAREGIVER PROFILE
    // ===============================

    else if (role === 'caregiver') {
      if (
        !relationshipWithPatient ||
        !patientName ||
        !caregiverEmergencyContact
      ) {
        return res.status(400).json({
          message: 'Missing caregiver additional fields',
        });
      }

      let linkedPatient = null;

      if (patientId) {
        linkedPatient = await User.findOne({
          _id: patientId,
          role: 'patient',
        });
      } else if (patientEmail) {
        linkedPatient = await User.findOne({
          email: patientEmail.trim().toLowerCase(),
          role: 'patient',
        });
      }

      if (!linkedPatient) {
        return res.status(400).json({
          message: 'Linked patient not found',
        });
      }

      const caregiverProfile = new CaregiverProfile({
        user: user._id,
        relationshipWithPatient,
        patientName,
        patient: linkedPatient._id,
        emergencyContact: caregiverEmergencyContact,
      });

      await caregiverProfile.save();
    }

    // ===============================
    // DOCTOR PROFILE
    // ===============================

    else if (role === 'doctor') {
      if (
        !medicalDegree ||
        !specialization ||
        !clinicName ||
        !yearsOfExperience ||
        !medicalRegistrationNumber
      ) {
        return res.status(400).json({
          message: 'Missing doctor additional fields',
        });
      }

      const doctorProfile = new DoctorProfile({
        user: user._id,
        medicalDegree,
        specialization,
        clinicName,
        yearsOfExperience,
        medicalRegistrationNumber,
      });

      await doctorProfile.save();
    }

    // ===============================
    // REGISTER SUCCESS
    // ===============================

    return res.status(201).json({
      message: 'User registered successfully',
    });

  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      message: 'Server error during registration',
    });
  }
};


// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  try {
    const {
      email,
      phone,
      emailOrPhone,
      password,
    } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password is required',
      });
    }

    // ===============================
    // PREPARE LOGIN VALUES
    // ===============================

    const loginEmail = (email || '')
      .trim()
      .toLowerCase();

    const loginPhone = (phone || '')
      .trim();

    const oldLoginField = (emailOrPhone || '')
      .trim();

    let user = null;

    // ===============================
    // LOGIN USING EMAIL
    // ===============================

    if (loginEmail) {
      user = await User.findOne({
        email: loginEmail,
      });
    }

    // ===============================
    // LOGIN USING PHONE
    // ===============================

    if (!user && loginPhone) {
      user = await User.findOne({
        phone: loginPhone,
      });
    }

    // ===============================
    // BACKWARD COMPATIBILITY
    // ===============================

    if (!user && oldLoginField) {
      user = await User.findOne({
        $or: [
          {
            email: oldLoginField.toLowerCase(),
          },
          {
            phone: oldLoginField,
          },
        ],
      });
    }

    // ===============================
    // USER NOT FOUND
    // ===============================

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email/phone or password',
      });
    }

    // ===============================
    // CHECK PASSWORD
    // ===============================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email/phone or password',
      });
    }

    // ===============================
    // JWT CONFIGURATION
    // ===============================

    if (!process.env.JWT_SECRET) {
      console.error(
        'JWT_SECRET is missing in .env'
      );

      return res.status(500).json({
        message: 'JWT configuration error',
      });
    }

    // ===============================
    // JWT TOKEN
    // ===============================

    const tokenPayload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    // ===============================
    // SUCCESS
    // ===============================

    return res.status(200).json({
      message: 'Login successful',

      token,

      user: {
        id: user._id,
        name: user.name,

        // IMPORTANT:
        // These were previously missing.
        age: user.age,
        gender: user.gender,

        role: user.role,
        email: user.email,
        phone: user.phone,

        // Used by the Profile page.
        profileImage: user.profileImage || '',

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Server error during login',
    });
  }
};