
import express from 'express';
import departmentService from '../services/departmentService';

const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
});

// Get department by id
router.get('/:id', async (req, res) => {
  try {
    const department = await departmentService.getDepartmentById(Number(req.params.id));
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error });
  }
});

// Create department
router.post('/', async (req, res) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  try {
    const department = await departmentService.updateDepartment(Number(req.params.id), req.body);
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    await departmentService.deleteDepartment(Number(req.params.id));
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
});

export default router;
