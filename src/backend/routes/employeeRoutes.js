
import express from 'express';
import { employeeService } from '../services/employeeService.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

// Get employee by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const employee = await employeeService.getEmployeeById(id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    next(error);
  }
});

// Create employee
router.post('/', async (req, res, next) => {
  try {
    const result = await employeeService.createEmployee(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update employee
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await employeeService.updateEmployee(id, req.body);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    next(error);
  }
});


router.put('/:id/change-password', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const result = await employeeService.changePassword(id, req.body);

    if (result === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});


// Update Multiple Device Access
router.put('/:id/update-multiple-access', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { allowMultipleDevices } = req.body;

    if (typeof allowMultipleDevices !== 'boolean') {
      return res.status(400).json({ message: 'allowMultipleDevices must be a boolean' });
    }

    const result = await employeeService.updateMutipleDeviceAccess(id, req.body);

    if (result === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Multiple device access updated successfully' });
  } catch (error) {
    console.error('Error updating multiple device access:', error);
    next(error);
  }
});



router.put('/:id/update-employee-access', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { allowEmployee } = req.body;

    if (typeof allowEmployee !== 'boolean') {
      return res.status(400).json({ message: 'allowMultipleDevices must be a boolean' });
    }

    const result = await employeeService.updateEmployeeAccess(id, req.body);

    if (result === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Multiple device access updated successfully' });
  } catch (error) {
    console.error('Error updating multiple device access:', error);
    next(error);
  }
});


router.put('/:id/approve-or-reject', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { approvalStatus } = req.body;

    if (approvalStatus !== 'approved' && approvalStatus !== 'rejected') {
      return res.status(400).json({ message: 'approvalStatus must be either "approved" or "rejected"' });
    }

    const result = await employeeService.approveOrRejectUser(id, req.body);

    if (result === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: `User has been ${approvalStatus} successfully` });
  } catch (error) {
    console.error('Error updating approval status:', error);
    next(error);
  }
});



// Delete employee
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await employeeService.deleteEmployee(id);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
});


employeeService.createDefaultEmployee()
  .then(result => {
    if (result.success) {
      console.log('Default employee setup:', result.message);
    } else {
      console.error('Default employee setup failed:', result.error);
    }
  });
export default router;
