import mysql from 'mysql2/promise';
import { pool } from '../config/db.js';

export const designationService = {
  getAllDesignations: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM designations');
      return rows;
    } catch (error) {
      console.error('Error fetching designations:', error);
      throw error;
    }
  },

  getDesignationById: async (id) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM designations WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error fetching designation by id:', error);
      throw error;
    }
  },

  getDesignationEmployees: async (designationId) => {
    try {
      const [rows] = await pool.query(
        `SELECT e.* 
         FROM employees e
         JOIN employee_designations ed ON e.id = ed.employeeId
         WHERE ed.designationId = ?`,
        [designationId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching designation employees:', error);
      throw error;
    }
  },

  createDesignation: async (designation) => {
    let connection;
    try {
      const { name, description } = designation;
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO designations (name, description, createdAt)
         VALUES (?, ?, ?)`,
        [name, description, new Date()]
      );

      await connection.commit();
      return { id: result.insertId, ...designation };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error creating designation:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  updateDesignation: async (id, designation) => {
    let connection;
    try {
      const { name, description } = designation;
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        `UPDATE designations
         SET name = ?, description = ?
         WHERE id = ?`,
        [name, description, id]
      );

      await connection.commit();
      return { id, ...designation };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error updating designation:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  deleteDesignation: async (id) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        'DELETE FROM designations WHERE id = ?',
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error deleting designation:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  assignEmployee: async (designationId, employeeId) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Insert the employee designation
      await connection.query(
        `INSERT INTO employee_designations (employeeId, designationId, assignedAt)
         VALUES (?, ?, ?)`,
        [employeeId, designationId, new Date()]
      );

      // Get designation and employee details
      const [designationRows] = await connection.query(
        'SELECT * FROM designations WHERE id = ?',
        [designationId]
      );
      
      const [employeeRows] = await connection.query(
        'SELECT * FROM employees WHERE id = ?',
        [employeeId]
      );

      await connection.commit();

      // if (designationRows.length > 0 && employeeRows.length > 0) {
      //   await sendDesignationAssignmentEmail(
      //     employeeRows[0].email,
      //     employeeRows[0].name,
      //     designationRows[0].name
      //   );
      // }

      return { designationId, employeeId };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error assigning employee to designation:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
};

export default designationService;