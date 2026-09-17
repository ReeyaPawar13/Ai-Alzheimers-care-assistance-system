import express from 'express';

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth.js';

import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js';

import {
  getSchedule,
  addSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';

import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

import {
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';

import {
  getMedicalReports,
  uploadMedicalReport,
  deleteMedicalReport,
} from '../controllers/medicalReportController.js';

import upload from '../middleware/upload.js';

const router = express.Router();

// ===============================
// CAREGIVER AUTHENTICATION
// ===============================

router.use(authenticateToken);
router.use(authorizeRoles('caregiver'));

// ===============================
// MEDICINES
// ===============================

router.get('/medicines', getMedicines);
router.post('/medicines', addMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

// ===============================
// DAILY SCHEDULE
// ===============================

router.get('/schedules', getSchedule);
router.post('/schedules', addSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

// ===============================
// TASKS
// ===============================

router.get('/tasks', getTasks);
router.post('/tasks', addTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// ===============================
// APPOINTMENTS
// ===============================

router.get('/appointments', getAppointments);
router.post('/appointments', addAppointment);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

// ===============================
// MEDICAL REPORTS
// ===============================

router.get('/medical-reports', getMedicalReports);

router.post(
  '/medical-reports',
  upload.single('medicalReport'),
  uploadMedicalReport
);

router.delete('/medical-reports/:id', deleteMedicalReport);

export default router;