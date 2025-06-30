
import express from 'express';
import departmentService from '../services/departmentService.js';

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


router.get('/:id/employees', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const employees = await departmentService.getDepartmentEmployees(id);
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

router.post('/:deptId/employees', async (req, res, next) => {
  try {
    // //console.log("req.params.",req.params)
    const projectId = parseInt(req.params.projectId);
    const { employeeId, designation, projectname } = req.body;
    
    const result = await departmentService.assignEmployeeToDepartment(projectId,req.body);
    
    if (result === 0) {
      return res.status(400).json({ message: 'Failed to assign employee to project' });
    }
    
    res.status(201).json({ message: 'Employee assigned to project successfully' });
  } catch (error) {
    next(error);
  }
});


export default router;
