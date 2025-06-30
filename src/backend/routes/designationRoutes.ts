
import express from 'express';
import designationService from '../services/designationService';

const router = express.Router();

// Get all designations
router.get('/', async (req, res) => {
  try {
    const designations = await designationService.getAllDesignations();
    res.json(designations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching designations', error });
  }
});

// Get employees by designation
router.get('/:id/employees', async (req, res) => {
  try {
    const employees = await designationService.getDesignationEmployees(Number(req.params.id));
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching designation employees', error });
  }
});

// Create designation
router.post('/', async (req, res) => {
  try {
    const designation = await designationService.createDesignation(req.body);
    res.status(201).json(designation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating designation', error });
  }
});

// Update designation
router.put('/:id', async (req, res) => {
  try {
    const designation = await designationService.updateDesignation(Number(req.params.id), req.body);
    res.json(designation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating designation', error });
  }
});

// Delete designation
router.delete('/:id', async (req, res) => {
  try {
    await designationService.deleteDesignation(Number(req.params.id));
    res.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting designation', error });
  }
});

export default router;
