
import express from 'express';
import leaveService from '../services/leaveService';

const router = express.Router();

// Get all leaves
router.get('/', async (req, res) => {
  try {
    const leaves = await leaveService.getAllLeaves();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaves', error });
  }
});

// Get leaves by employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const leaves = await leaveService.getLeavesByEmployee(req.params.employeeId);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaves', error });
  }
});

// Create leave request
router.post('/', async (req, res) => {
  try {
    const leave = await leaveService.createLeave(req.body);
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Error creating leave request', error });
  }
});

// Update leave status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const leave = await leaveService.updateLeaveStatus(Number(req.params.id), status, reason);
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave status', error });
  }
});

export default router;
