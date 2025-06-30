
import sql from 'mssql';
import { pool } from '../config/db';

export const projectService = {
  getAllProjects: async () => {
    try {
      const result = await pool.request().query(`
        SELECT p.*, l.name as locationName 
        FROM projects p
        LEFT JOIN locations l ON p.locationId = l.id
      `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  getProjectById: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT p.*, l.name as locationName 
          FROM projects p
          LEFT JOIN locations l ON p.locationId = l.id
          WHERE p.id = @id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching project by id:', error);
      throw error;
    }
  },

  getProjectEmployees: async (projectId: number) => {
    try {
      const result = await pool.request()
        .input('projectId', sql.Int, projectId)
        .query(`
          SELECT e.*, pe.designation
          FROM employees e
          JOIN project_employees pe ON e.id = pe.employeeId
          WHERE pe.projectId = @projectId
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching project employees:', error);
      throw error;
    }
  },
  
  createProject: async (project: any) => {
    try {
      const { name, description, locationId, startDate, endDate, status } = project;
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description || '')
        .input('locationId', sql.Int, locationId)
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate || null)
        .input('status', sql.NVarChar, status)
        .input('createdAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO projects (name, description, locationId, startDate, endDate, status, createdAt)
          OUTPUT INSERTED.id
          VALUES (@name, @description, @locationId, @startDate, @endDate, @status, @createdAt)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  updateProject: async (id: number, project: any) => {
    try {
      const { name, description, locationId, startDate, endDate, status } = project;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description || '')
        .input('locationId', sql.Int, locationId)
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate || null)
        .input('status', sql.NVarChar, status)
        .query(`
          UPDATE projects 
          SET name = @name, 
              description = @description, 
              locationId = @locationId, 
              startDate = @startDate, 
              endDate = @endDate, 
              status = @status
          WHERE id = @id
        `);
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },
  
  deleteProject: async (id: number) => {
    try {
      // First delete from project_employees
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM project_employees WHERE projectId = @id');
        
      // Then delete the project
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM projects WHERE id = @id');
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  assignEmployeeToProject: async (projectId: number, employeeId: number, designation: string) => {
    try {
      const result = await pool.request()
        .input('projectId', sql.Int, projectId)
        .input('employeeId', sql.Int, employeeId)
        .input('designation', sql.NVarChar, designation)
        .input('assignedAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO project_employees (projectId, employeeId, designation, assignedAt)
          VALUES (@projectId, @employeeId, @designation, @assignedAt)
        `);
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error assigning employee to project:', error);
      throw error;
    }
  },

  removeEmployeeFromProject: async (projectId: number, employeeId: number) => {
    try {
      const result = await pool.request()
        .input('projectId', sql.Int, projectId)
        .input('employeeId', sql.Int, employeeId)
        .query('DELETE FROM project_employees WHERE projectId = @projectId AND employeeId = @employeeId');
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error removing employee from project:', error);
      throw error;
    }
  }
};

export default projectService;
