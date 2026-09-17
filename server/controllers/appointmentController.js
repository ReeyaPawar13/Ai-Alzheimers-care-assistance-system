import Appointment from '../models/Appointment.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import User from '../models/User.js';

// Get all appointments for the caregiver's linked patient
export const getAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    const caregiverProfile = await CaregiverProfile.findOne({
      user: req.user._id,
    });

    if (!caregiverProfile) {
      return res.status(404).json({
        message: 'Caregiver profile not found',
      });
    }

    if (!caregiverProfile.patient) {
      return res.status(400).json({
        message: 'No patient is linked to this caregiver',
      });
    }

    const appointments = await Appointment.find({
      caregiver: req.user._id,
      patient: caregiverProfile.patient,
    })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);

    res.status(500).json({
      message: 'Failed to get appointments',
    });
  }
};

// Add a new appointment
export const addAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    const caregiverProfile = await CaregiverProfile.findOne({
      user: req.user._id,
    });

    if (!caregiverProfile) {
      return res.status(404).json({
        message: 'Caregiver profile not found',
      });
    }

    if (!caregiverProfile.patient) {
      return res.status(400).json({
        message: 'No patient is linked to this caregiver',
      });
    }

    const {
      date,
      time,
      title,
      description,
      location,
      doctor,
      status,
    } = req.body;

    if (!date || !time || !title) {
      return res.status(400).json({
        message: 'Date, time and title are required',
      });
    }

    let doctorId = null;

    if (doctor) {
      const doctorUser = await User.findOne({
        _id: doctor,
        role: 'doctor',
      });

      if (!doctorUser) {
        return res.status(400).json({
          message: 'Selected doctor not found',
        });
      }

      doctorId = doctorUser._id;
    }

    const appointment = new Appointment({
      patient: caregiverProfile.patient,
      caregiver: req.user._id,
      doctor: doctorId,
      date,
      time,
      title,
      description: description || '',
      location: location || '',
      status: status || 'Scheduled',
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Add appointment error:', error);

    res.status(500).json({
      message: 'Failed to add appointment',
    });
  }
};

// Update an appointment
export const updateAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    const caregiverProfile = await CaregiverProfile.findOne({
      user: req.user._id,
    });

    if (!caregiverProfile) {
      return res.status(404).json({
        message: 'Caregiver profile not found',
      });
    }

    if (!caregiverProfile.patient) {
      return res.status(400).json({
        message: 'No patient is linked to this caregiver',
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      caregiver: req.user._id,
      patient: caregiverProfile.patient,
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found or permission denied',
      });
    }

    const {
      date,
      time,
      title,
      description,
      location,
      doctor,
      status,
    } = req.body;

    if (date !== undefined) {
      appointment.date = date;
    }

    if (time !== undefined) {
      appointment.time = time;
    }

    if (title !== undefined) {
      appointment.title = title;
    }

    if (description !== undefined) {
      appointment.description = description;
    }

    if (location !== undefined) {
      appointment.location = location;
    }

    if (status !== undefined) {
      appointment.status = status;
    }

    if (doctor !== undefined) {
      if (!doctor) {
        appointment.doctor = null;
      } else {
        const doctorUser = await User.findOne({
          _id: doctor,
          role: 'doctor',
        });

        if (!doctorUser) {
          return res.status(400).json({
            message: 'Selected doctor not found',
          });
        }

        appointment.doctor = doctorUser._id;
      }
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment error:', error);

    res.status(500).json({
      message: 'Failed to update appointment',
    });
  }
};

// Delete an appointment
export const deleteAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({
        message: 'Permission denied',
      });
    }

    const caregiverProfile = await CaregiverProfile.findOne({
      user: req.user._id,
    });

    if (!caregiverProfile) {
      return res.status(404).json({
        message: 'Caregiver profile not found',
      });
    }

    if (!caregiverProfile.patient) {
      return res.status(400).json({
        message: 'No patient is linked to this caregiver',
      });
    }

    const deletedAppointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      caregiver: req.user._id,
      patient: caregiverProfile.patient,
    });

    if (!deletedAppointment) {
      return res.status(404).json({
        message: 'Appointment not found or permission denied',
      });
    }

    res.json({
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Delete appointment error:', error);

    res.status(500).json({
      message: 'Failed to delete appointment',
    });
  }
};