
import express from 'express';
import { shiftService } from '../services/shiftService.js';

const router = express.Router();

// Get all shifts
router.get('/', async (req, res, next) => {
  try {
    const shifts = await shiftService.getAllShifts();
    res.json(shifts);
  } catch (error) {
    next(error);
  }
});

// Get shift by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const shift = await shiftService.getShiftById(id);
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    res.json(shift);
  } catch (error) {
    next(error);
  }
});

// Create shift
router.post('/', async (req, res, next) => {
  try {
    const result = await shiftService.createShift(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update shift
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await shiftService.updateShift(id, req.body);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    res.json({ message: 'Shift updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete shift
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await shiftService.deleteShift(id);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
