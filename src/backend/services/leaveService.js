import mysql from 'mysql2/promise';
import { pool } from '../config/db.js';

export const leaveService = {
  getAllLeaves: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM leave_histories');
      return rows;
    } catch (error) {
      console.error('Error fetching leaves:', error);
      throw error;
    }
  },

  getLeavesByEmployee: async (employeeId) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM leaves WHERE employeeId = ? ORDER BY createdAt DESC',
        [employeeId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching leaves by employee:', error);
      throw error;
    }
  },

  createLeave: async (leave) => {
    let connection;
    try {
      const { employeeId, type, startDate, endDate, reason } = leave;
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO leaves (employeeId, type, startDate, endDate, reason, status, createdAt)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [employeeId, type, startDate, endDate, reason, new Date()]
      );

      const [employee] = await connection.query(
        'SELECT * FROM employees WHERE id = ?',
        [employeeId]
      );

      if (employee.length > 0) {
        // await sendLeaveRequestEmail(
        //   'admin@company.com',
        //   employee[0].name,
        //   type,
        //   startDate,
        //   endDate,
        //   reason
        // );
      }

      await connection.commit();
      return { id: result.insertId, ...leave };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error creating leave:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  updateLeaveStatus: async (id, status, reason) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      let query = 'UPDATE leave_histories SET status = ?';
      const params = [status];

      if (reason) {
        query += ', rejection_reason = ?';
        params.push(reason);
      }

      query += ' WHERE id = ?';
      params.push(id);

      const [result] = await connection.query(query, params);

      await connection.commit();
      return { id, status, reason };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error updating leave status:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
};

export default leaveService;