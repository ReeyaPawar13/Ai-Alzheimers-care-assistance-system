import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import PatientProfile from '../models/PatientProfile.js';


const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('doctor'));

// Example route to get assigned patients
router.get('/patients', async (req, res) => {
  try {
    const doctorId = req.user._id;
    // Fetch patients where doctor field matches this doctor
    const patients = await PatientProfile.find({ doctor: doctorId }).populate('user', '-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get patients' });
  }
});

// Additional routes: appointments, reports, chat, notes to be added similarly.

export default router;
