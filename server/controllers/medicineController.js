import Medicine from '../models/Medicine.js';

export const getMedicines = async (req, res) => {
  try {
    const patientId = req.user._id;
    const medicines = await Medicine.find({ patient: patientId }).sort({ time: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get medicines' });
  }
};

export const addMedicine = async (req, res) => {
  try {
    const patientId = req.user._id;
    if (req.user.role !== 'caregiver') return res.status(403).json({ message: 'Permission denied' });

    const { name, dosage, time, instructions } = req.body;

    const medicine = new Medicine({
      patient: patientId,
      name,
      dosage,
      time,
      instructions,
      status: 'pending',
    });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add medicine' });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') return res.status(403).json({ message: 'Permission denied' });

    const medId = req.params.id;
    const update = req.body;
    const medicine = await Medicine.findByIdAndUpdate(medId, update, { new: true });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update medicine' });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') return res.status(403).json({ message: 'Permission denied' });

    const medId = req.params.id;
    await Medicine.findByIdAndDelete(medId);
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete medicine' });
  }
};
