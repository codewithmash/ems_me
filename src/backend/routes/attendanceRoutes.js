
import express from 'express';
import { attendanceService } from '../services/attendanceService.js';

const router = express.Router();

// Get all attendance records
router.get('/', async (req, res, next) => {
  try {
    const attendance = await attendanceService.getAllAttendance();
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});

// Get attendance by date
router.get('/date/:date', async (req, res, next) => {
  try {
    const attendance = await attendanceService.getAttendanceByDate(req.params.date);
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});


router.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const attendance = await attendanceService.getAttendanceByEmployeeid(req.params.employeeId);
    res.json(attendance);
  } catch (error) {
    next(error);
  }
});


// Create attendance
router.post('/', async (req, res, next) => {
  try {
    const result = await attendanceService.createAttendance(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update attendance
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await attendanceService.updateAttendance(id, req.body);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance record updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
