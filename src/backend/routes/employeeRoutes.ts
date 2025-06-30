
import express, { Request, Response, NextFunction } from 'express';
import { employeeService } from '../services/employeeService';
import { EmployeeListResponse, EmployeeResponse, BaseResponse, ErrorResponse } from '../types';

const router = express.Router();

// Get all employees
router.get('/', async (req: Request, res: Response<EmployeeListResponse>, next: NextFunction) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

// Get employee by ID
router.get('/:id', async (req: Request, res: Response<EmployeeResponse | ErrorResponse>, next: NextFunction) => {
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
router.post('/', async (req: Request, res: Response<EmployeeResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const result = await employeeService.createEmployee(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update employee
router.put('/:id', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
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

// Delete employee
router.delete('/:id', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
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




export default router;
