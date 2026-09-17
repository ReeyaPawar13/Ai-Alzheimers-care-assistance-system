import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patient.js';
import caregiverRoutes from './routes/caregiver.js';
import doctorRoutes from './routes/doctor.js';
import aiRoutes from './routes/ai.js';
import memoryBookRoutes from './routes/memoryBook.js';
import profileRoutes from './routes/profile.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// SERVE UPLOADED MEDICAL REPORTS
// ==========================================

app.use(
  '/uploads',
  express.static('uploads')
);

// ==========================================
// MONGODB CONNECTION
// ==========================================

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from .env');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error.message);
    throw error;
  }
};

// ==========================================
// MONGODB EVENTS
// ==========================================

mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('error', (error) => {
  console.error(
    '🔴 MongoDB connection error:',
    error.message
  );
});

mongoose.connection.on('disconnected', () => {
  console.error(
    '🟠 MongoDB disconnected. Waiting for reconnection...'
  );
});

mongoose.connection.on('reconnected', () => {
  console.log(
    '🟢 MongoDB reconnected successfully'
  );
});

// ==========================================
// ROOT ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: 'CareMate Backend Running',
    database:
      mongoose.connection.readyState === 1
        ? 'Connected'
        : 'Disconnected',
  });
});

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use(
  '/api/auth',
  authRoutes
);

// Patient
app.use(
  '/api',
  patientRoutes
);

// Caregiver
app.use(
  '/api/caregiver',
  caregiverRoutes
);

// Doctor
app.use(
  '/api/doctor',
  doctorRoutes
);

// AI
app.use(
  '/api/ai',
  aiRoutes
);

// Memory Book
app.use(
  '/api/memory-book',
  memoryBookRoutes
);

// Caregiver Profile
app.use(
  '/api/profile',
  profileRoutes
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: 'API route not found',
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message:
      err.message || 'Internal Server Error',
  });
});

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `🚀 CareMate Server running on port ${PORT}`
      );

      console.log(
        `🌐 http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error('');

    console.error(
      '❌ Server was NOT started because MongoDB is unavailable.'
    );

    console.error(
      '👉 Check MongoDB Atlas Network Access / IP whitelist.'
    );

    process.exit(1);
  }
};

startServer();