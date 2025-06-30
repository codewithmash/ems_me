
import express, { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/projectService';
import { ProjectListResponse, ProjectResponse, ProjectEmployeeListResponse, BaseResponse, ErrorResponse } from '../types';

const router = express.Router();

// Get all projects
router.get('/', async (req: Request, res: Response<ProjectListResponse>, next: NextFunction) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// Get project by ID
router.get('/:id', async (req: Request, res: Response<ProjectResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const project = await projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Get project employees
router.get('/:id/employees', async (req: Request, res: Response<ProjectEmployeeListResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const employees = await projectService.getProjectEmployees(id);
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', async (req: Request, res: Response<ProjectResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const result = await projectService.createProject(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const result = await projectService.updateProject(id, req.body);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const result = await projectService.deleteProject(id);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Assign employee to project
router.post('/:projectId/employees', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { employeeId, designation } = req.body;
    
    const result = await projectService.assignEmployeeToProject(projectId, employeeId, designation);
    
    if (result === 0) {
      return res.status(400).json({ message: 'Failed to assign employee to project' });
    }
    
    res.status(201).json({ message: 'Employee assigned to project successfully' });
  } catch (error) {
    next(error);
  }
});

// Remove employee from project
router.delete('/:projectId/employees/:employeeId', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const employeeId = parseInt(req.params.employeeId);
    
    const result = await projectService.removeEmployeeFromProject(projectId, employeeId);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Employee not found in project' });
    }
    
    res.json({ message: 'Employee removed from project successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
