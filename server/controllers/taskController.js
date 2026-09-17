import Task from '../models/Task.js';

export const getTasks = async (req, res) => {
  try {
    const patientId = req.user._id;
    const tasks = await Task.find({ patient: patientId }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get tasks' });
  }
};

export const addTask = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') return res.status(403).json({ message: 'Permission denied' });

    const patientId = req.body.patientId || req.user._id;

    const { title, dueTime } = req.body;

    const task = new Task({ patient: patientId, title, dueTime, status: 'pending' });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') return res.status(403).json({ message: 'Permission denied' });

    const taskId = req.params.id;
    const update = req.body;
    const task = await Task.findByIdAndUpdate(taskId, update, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') return res.status(403).json({ message: 'Permission denied' });

    const taskId = req.params.id;
    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// Patient marks task complete
export const completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!task.patient.equals(req.user._id)) return res.status(403).json({ message: 'Permission denied' });

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete task' });
  }
};
