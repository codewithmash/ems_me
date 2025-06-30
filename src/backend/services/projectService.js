import { pool } from '../config/db.js';

export const projectService = {
  getAllProjects: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM projects');
      return rows;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  getProjectById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, l.name as locationName 
        FROM projects p
        LEFT JOIN locations l ON p.locationId = l.id
        WHERE p.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching project by id:', error);
      throw error;
    }
  },

  getProjectEmployees: async (projectId) => {
    try {
      // First, get the project name based on the projectId
      const [projectRows] = await pool.query(`
        SELECT name FROM projects WHERE id = ?
      `, [projectId]);

      if (!projectRows || projectRows.length === 0) {
        return [];
      }

      const projectName = projectRows[0].name;

      // Second, get the users assigned to the retrieved project name
      const [employeeRows] = await pool.query(`
        SELECT * FROM users WHERE project_assigned = ?
      `, [projectName]);

      return employeeRows;
    } catch (error) {
      console.error('Error fetching project employees:', error);
      throw error;
    }
  },
  
  createProject: async (project) => {
    try {
      const { name, description, startDate, endDate, status } = project;
      const [result] = await pool.query(`
        INSERT INTO projects 
        (name, description, startDate, endDate, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        name, 
        description || '', 
        startDate, 
        endDate || null, 
        status, 
        new Date()
      ]);
      
      return { id: result.insertId };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  updateProject: async (id, project) => {
    try {
      const { name, description, startDate, endDate, status } = project;
      const [result] = await pool.query(`
        UPDATE projects 
        SET name = ?, 
            description = ?, 
            startDate = ?, 
            endDate = ?, 
            status = ?
        WHERE id = ?
      `, [
        name, 
        description || '', 
        startDate, 
        endDate || null, 
        status, 
        id
      ]);
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },
  
  deleteProject: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  assignEmployeeToProject: async (projectId, data) => {
    const connection = await pool.getConnection();
    const { employeeId, designation, projectname } = data;
    
    try {
      await connection.beginTransaction();
      
      try {
        // Update the users table to set project_assigned for the employee
        const [updateResult] = await connection.query(`
          UPDATE users
          SET project_assigned = ?
          WHERE id = ?
        `, [projectname, employeeId]);

        await connection.commit();
        return updateResult.affectedRows;
      } catch (error) {
        await connection.rollback();
        console.error('Error assigning employee to project (transaction rolled back):', error);
        throw error;
      }
    } catch (error) {
      console.error('Error starting transaction:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  removeEmployeeFromProject: async (projectId, employeeId) => {
    try {
      const [result] = await pool.query(`
        DELETE FROM project_employees 
        WHERE projectId = ? AND employeeId = ?
      `, [projectId, employeeId]);
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error removing employee from project:', error);
      throw error;
    }
  }
};

export default projectService;