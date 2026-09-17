import bcrypt from 'bcrypt';
import User from '../models/User.js';
import CaregiverProfile from '../models/CaregiverProfile.js';

const getUserId = (req) => {
  return req.user?.id || req.user?.userId || req.user?._id;
};

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const caregiverProfile = await CaregiverProfile.findOne({
      user: userId,
    });

    return res.status(200).json({
      user,
      caregiverProfile: caregiverProfile || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);

    return res.status(500).json({
      message: 'Failed to load profile.',
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const {
      name,
      age,
      gender,
      email,
      phone,
      relationshipWithPatient,
      patientName,
      emergencyContact,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: 'Full name is required.',
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: 'Email address is required.',
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        message: 'Phone number is required.',
      });
    }

    const existingEmail = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: 'This email address is already registered.',
      });
    }

    const existingPhone = await User.findOne({
      phone: phone.trim(),
      _id: { $ne: userId },
    });

    if (existingPhone) {
      return res.status(409).json({
        message: 'This phone number is already registered.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone.trim();

    if (age !== undefined && age !== '') {
      user.age = Number(age);
    }

    if (gender) {
      user.gender = gender;
    }

    await user.save();

    // Update caregiver-specific information if a caregiver profile exists.
    if (
      relationshipWithPatient !== undefined ||
      patientName !== undefined ||
      emergencyContact !== undefined
    ) {
      const caregiverProfile = await CaregiverProfile.findOne({
        user: userId,
      });

      if (caregiverProfile) {
        if (relationshipWithPatient !== undefined) {
          caregiverProfile.relationshipWithPatient =
            relationshipWithPatient.trim();
        }

        if (patientName !== undefined) {
          caregiverProfile.patientName = patientName.trim();
        }

        if (emergencyContact !== undefined) {
          caregiverProfile.emergencyContact =
            emergencyContact.trim();
        }

        await caregiverProfile.save();
      }
    }

    const updatedUser = await User.findById(userId).select('-password');

    const updatedCaregiverProfile =
      await CaregiverProfile.findOne({
        user: userId,
      });

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser,
      caregiverProfile: updatedCaregiverProfile || null,
    });
  } catch (error) {
    console.error('Update profile error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          'Email or phone number is already being used by another account.',
      });
    }

    return res.status(500).json({
      message: 'Failed to update profile.',
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'All password fields are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must contain at least 6 characters.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New password and confirm password do not match.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Current password is incorrect.',
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message:
          'New password must be different from your current password.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);

    return res.status(500).json({
      message: 'Failed to change password.',
    });
  }
};

// DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    await CaregiverProfile.findOneAndDelete({
      user: userId,
    });

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    console.error('Delete account error:', error);

    return res.status(500).json({
      message: 'Failed to delete account.',
    });
  }
};