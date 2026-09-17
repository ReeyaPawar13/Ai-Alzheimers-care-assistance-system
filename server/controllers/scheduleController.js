import Schedule from '../models/Schedule.js';
import CaregiverProfile from '../models/CaregiverProfile.js';

// ===============================
// GET SCHEDULE
// ===============================
export const getSchedule = async (req, res) => {
  try {
    let patientId;

    // --------------------------------
    // PATIENT
    // --------------------------------
    if (req.user.role === 'patient') {
      patientId = req.user._id;
    }

    // --------------------------------
    // CAREGIVER
    // --------------------------------
    else if (req.user.role === 'caregiver') {
      const caregiverProfile = await CaregiverProfile.findOne({
        user: req.user._id,
      });

      if (!caregiverProfile) {
        return res.status(404).json({
          message: 'Caregiver profile not found',
        });
      }

      patientId = caregiverProfile.patient;
    }

    // --------------------------------
    // OTHER ROLES
    // --------------------------------
    else {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    const schedule = await Schedule.find({
      patient: patientId,
    }).sort({ time: 1 });

    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);

    res.status(500).json({
      message: 'Failed to get schedule',
    });
  }
};


// ===============================
// ADD SCHEDULE
// ===============================
export const addSchedule = async (req, res) => {
  try {
    // Only caregiver can add schedules
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    // Find caregiver profile
    const caregiverProfile = await CaregiverProfile.findOne({
      user: req.user._id,
    });

    if (!caregiverProfile) {
      return res.status(404).json({
        message: 'Caregiver profile not found',
      });
    }

    // Get linked patient
    const patientId = caregiverProfile.patient;

    if (!patientId) {
      return res.status(400).json({
        message: 'No patient is linked to this caregiver',
      });
    }

    const {
      time,
      activity,
      notes,
    } = req.body;

    // Validate required fields
    if (!time || !activity) {
      return res.status(400).json({
        message: 'Time and activity are required',
      });
    }

    // Create schedule for linked patient
    const newSchedule = new Schedule({
      patient: patientId,
      time,
      activity,
      notes: notes || '',
    });

    await newSchedule.save();

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Add schedule error:', error);

    res.status(500).json({
      message: 'Failed to add schedule',
    });
  }
};


// ===============================
// UPDATE SCHEDULE
// ===============================
export const updateSchedule = async (req, res) => {
  try {
    // Only caregiver can update schedules
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    // Find caregiver profile
    const caregiverProfile = await CaregiverProfile.findOne({
      user: req.user._id,
    });

    if (!caregiverProfile) {
      return res.status(404).json({
        message: 'Caregiver profile not found',
      });
    }

    const patientId = caregiverProfile.patient;

    if (!patientId) {
      return res.status(400).json({
        message: 'No patient is linked to this caregiver',
      });
    }

    const schedId = req.params.id;

    // Find schedule belonging to the linked patient
    const schedule = await Schedule.findOne({
      _id: schedId,
      patient: patientId,
    });

    if (!schedule) {
      return res.status(404).json({
        message: 'Schedule not found or permission denied',
      });
    }

    const {
      time,
      activity,
      notes,
    } = req.body;

    // Update only allowed fields
    if (time !== undefined) {
      schedule.time = time;
    }

    if (activity !== undefined) {
      schedule.activity = activity;
    }

    if (notes !== undefined) {
      schedule.notes = notes;
    }

    await schedule.save();

    res.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);

    res.status(500).json({
      message: 'Failed to update schedule',
    });
  }
};


// ===============================
// DELETE SCHEDULE
// ===============================
export const deleteSchedule = async (req, res) => {
  try {
    // Only caregiver can delete schedules
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    // Find caregiver profile
    const caregiverProfile = await CaregiverProfile.findOne({
      user: req.user._id,
    });

    if (!caregiverProfile) {
      return res.status(404).json({
        message: 'Caregiver profile not found',
      });
    }

    const patientId = caregiverProfile.patient;

    if (!patientId) {
      return res.status(400).json({
        message: 'No patient is linked to this caregiver',
      });
    }

    const schedId = req.params.id;

    // Delete only if schedule belongs to caregiver's patient
    const deletedSchedule = await Schedule.findOneAndDelete({
      _id: schedId,
      patient: patientId,
    });

    if (!deletedSchedule) {
      return res.status(404).json({
        message: 'Schedule not found or permission denied',
      });
    }

    res.json({
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('Delete schedule error:', error);

    res.status(500).json({
      message: 'Failed to delete schedule',
    });
  }
};