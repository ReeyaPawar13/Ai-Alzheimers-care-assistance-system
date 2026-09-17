import MedicalReport from '../models/MedicalReport.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import fs from 'fs';
import path from 'path';

const getPatientForCaregiver = async (caregiverId) => {
  const profile = await CaregiverProfile.findOne({
    user: caregiverId,
  });

  if (!profile) {
    throw new Error('Caregiver profile not found');
  }

  return profile.patient;
};

// ==========================================
// GET ALL MEDICAL REPORTS
// ==========================================

export const getMedicalReports = async (req, res) => {
  try {
    const patientId = await getPatientForCaregiver(req.user.id);

    const reports = await MedicalReport.find({
      patient: patientId,
      caregiver: req.user.id,
    }).sort({ uploadedAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Get medical reports error:', error);

    res.status(500).json({
      message: error.message || 'Unable to fetch medical reports',
    });
  }
};

// ==========================================
// UPLOAD MEDICAL REPORT
// ==========================================

export const uploadMedicalReport = async (req, res) => {
  try {
    const patientId = await getPatientForCaregiver(req.user.id);

    if (!req.file) {
      return res.status(400).json({
        message: 'Please select a medical report file',
      });
    }

    const {
      reportName,
      reportType,
    } = req.body;

    if (!reportName || !reportType) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        message: 'Report name and report type are required',
      });
    }

    const relativeFilePath = path
      .relative(process.cwd(), req.file.path)
      .replace(/\\/g, '/');

    const fileUrl = `/${relativeFilePath}`;

    const report = await MedicalReport.create({
      patient: patientId,
      caregiver: req.user.id,
      reportName,
      reportType,
      fileName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date(),
    });

    res.status(201).json({
      message: 'Medical report uploaded successfully',
      report,
    });
  } catch (error) {
    console.error('Upload medical report error:', error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error.message || 'Unable to upload medical report',
    });
  }
};

// ==========================================
// DELETE MEDICAL REPORT
// ==========================================

export const deleteMedicalReport = async (req, res) => {
  try {
    const patientId = await getPatientForCaregiver(req.user.id);

    const report = await MedicalReport.findOne({
      _id: req.params.id,
      patient: patientId,
      caregiver: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        message: 'Medical report not found',
      });
    }

    // Delete physical file from server
    if (report.fileUrl) {
      const relativePath = report.fileUrl.replace(/^\//, '');
      const filePath = path.join(process.cwd(), relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await MedicalReport.findByIdAndDelete(report._id);

    res.status(200).json({
      message: 'Medical report deleted successfully',
    });
  } catch (error) {
    console.error('Delete medical report error:', error);

    res.status(500).json({
      message: error.message || 'Unable to delete medical report',
    });
  }
};

export default {
  getMedicalReports,
  uploadMedicalReport,
  deleteMedicalReport,
};