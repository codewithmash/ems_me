import mysql from 'mysql2/promise';
import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

async function getLocationName(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data?.address ? data.display_name : null;
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}

export const employeeService = {
  getAllEmployees: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          id,
          employee_id as employeeId,
          name,
          email,
          phone,
          department,
          is_face_registered as isFaceRegistered,
          isMultipleDeviceAllowed,
          role,
          leave_status as leaveStatus,
          availability,
          shift,
          location,
          face_data_status as faceDataStatus,
          created_at as createdAt
        FROM users
      `);
      
      return {
        success: true,
        employees: rows
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      return {
        success: false,
        error: 'Failed to fetch employees',
        code: 500
      };
    }
  },

  getEmployeeById: async (id) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          id,
          employee_id as employeeId,
          name,
          email,
          phone,
          department,
          is_face_registered as isFaceRegistered,
          isMultipleDeviceAllowed,
          role,
          leave_status as leaveStatus,
          availability,
          shift,
          location,
          face_data_status as faceDataStatus,
          created_at as createdAt
        FROM users WHERE id = ?`, 
        [id]
      );

      const employee = rows[0];
      if (!employee) {
        return {
          success: false,
          error: 'Employee not found',
          code: 404
        };
      }

      return {
        success: true,
        employee
      };
    } catch (error) {
      console.error('Error fetching employee by id:', error);
      return {
        success: false,
        error: 'Failed to fetch employee',
        code: 500
      };
    }
  },

  createEmployee: async (employeeData) => {
    let connection;
    try {
      const { 
        name,
        email,
        phone,
        department,
        password,
        role,
        isMultipleDeviceAllowed
      } = employeeData;

      const hashedPassword = await bcrypt.hash(password || 'defaultPassword', 10);
      const employeeId = `EMP${Math.floor(Date.now() / 1000)}`;

      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO users (
          employee_id,
          name,
          email,
          phone,
          department,
          password,
          role,
          isMultipleDeviceAllowed,
          leave_status,
          availability,
          face_data_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          name,
          email,
          phone,
          department,
          hashedPassword,
          role || 'employee',
          isMultipleDeviceAllowed ? 1 : 0,
          'not_on_leave',
          true,
          'pending'
        ]
      );

      const insertId = result.insertId;
      const [newEmployee] = await connection.query(
        `SELECT * FROM users WHERE id = ?`,
        [insertId]
      );

      await connection.commit();
      return {
        success: true,
        employee: newEmployee[0]
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error creating employee:', error);
      return {
        success: false,
        error: 'Failed to create employee',
        code: 500
      };
    } finally {
      if (connection) connection.release();
    }
  },

  updateEmployee: async (id, employeeData) => {
    let connection;
    try {
      const { 
        name,
        email,
        phone,
        department,
        role,
        isMultipleDeviceAllowed,
        availability,
        faceDataStatus
      } = employeeData;

      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        `UPDATE users SET 
          name = ?,
          email = ?,
          phone = ?,
          department = ?,
          role = ?,
          isMultipleDeviceAllowed = ?,
          availability = ?,
          face_data_status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          name,
          email,
          phone,
          department,
          role,
          isMultipleDeviceAllowed,
          availability,
          faceDataStatus,
          id
        ]
      );

      await connection.commit();
      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error updating employee:', error);
      return {
        success: false,
        error: 'Failed to update employee',
        code: 500
      };
    } finally {
      if (connection) connection.release();
    }
  },

  deleteEmployee: async (id) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      await connection.commit();
      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error deleting employee:', error);
      return {
        success: false,
        error: 'Failed to delete employee',
        code: 500
      };
    } finally {
      if (connection) connection.release();
    }
  },

  changePassword: async (id, data) => {
    let connection;
    try {
      const { oldPassword, newPassword } = data;

      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Get current password
      const [rows] = await connection.query(
        'SELECT password FROM users WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return {
          success: false,
          error: 'Employee not found',
          code: 404
        };
      }

      const currentPassword = rows[0].password;
      const isMatch = await bcrypt.compare(oldPassword, currentPassword);

      if (!isMatch) {
        return {
          success: false,
          error: 'Old password does not match',
          code: 401
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await connection.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );

      await connection.commit();
      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error changing password:', error);
      return {
        success: false,
        error: 'Failed to change password',
        code: 500
      };
    } finally {
      if (connection) connection.release();
    }
  },

  updateMultipleDeviceAccess: async (id, data) => {
    let connection;
    try {
      const { allowMultipleDevices } = data;

      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        'UPDATE users SET isMultipleDeviceAllowed = ? WHERE id = ?',
        [allowMultipleDevices ? 1 : 0, id]
      );

      await connection.commit();
      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error updating multiple device access:', error);
      return {
        success: false,
        error: 'Failed to update device access',
        code: 500
      };
    } finally {
      if (connection) connection.release();
    }
  },

  updateEmployeeAccess: async (id, data) => {
    let connection;
    try {
      const { allowEmployee } = data;

      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        'UPDATE users SET availability = ? WHERE id = ?',
        [allowEmployee ? 1 : 0, id]
      );

      await connection.commit();
      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error updating employee access:', error);
      return {
        success: false,
        error: 'Failed to update employee access',
        code: 500
      };
    } finally {
      if (connection) connection.release();
    }
  },

  approveOrRejectUser: async (id, data) => {
    let connection;
    try {
      const { approvalStatus } = data;

      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        'UPDATE users SET face_data_status = ? WHERE id = ?',
        [approvalStatus, id]
      );

      await connection.commit();
      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error updating approval status:', error);
      return {
        success: false,
        error: 'Failed to update approval status',
        code: 500
      };
    } finally {
      if (connection) connection.release();
    }
  },

  getEmployeeAttendance: async (employeeId) => {
    try {
      const [rows] = await pool.query(
        'SELECT date, checkinTime, checkoutTime, status FROM attendance_records WHERE employee_id = ? ORDER BY date DESC',
        [employeeId]
      );
      return {
        success: true,
        attendanceRecords: rows
      };
    } catch (error) {
      console.error('Error fetching employee attendance:', error);
      return {
        success: false,
        error: 'Failed to fetch attendance',
        code: 500
      };
    }
  },

  createDefaultEmployee: async () => {
    let connection;
    try {
      const defaultEmployeeData = {
        name: 'Admin User',
        email: 'codecontinued@gmail.com',
        phone: '1234567890',
        department: 'IT',
        password: 'admin123', // In production, use a more secure default password
        role: 'admin',
        isMultipleDeviceAllowed: true
      };

      // Check if default employee already exists
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [defaultEmployeeData.email]
      );

      if (existing.length > 0) {
        return {
          success: true,
          message: 'Default employee already exists',
          employeeId: existing[0].id
        };
      }

      // Create the default employee
      const createResult = await employeeService.createEmployee(defaultEmployeeData);
      
      if (!createResult.success) {
        throw new Error('Failed to create default employee');
      }

      // Update the default employee to approved status
      await pool.query(
        'UPDATE users SET face_data_status = "approved" WHERE id = ?',
        [createResult.employee.id]
      );

      return {
        success: true,
        message: 'Default employee created successfully',
        employee: createResult.employee
      };
    } catch (error) {
      console.error('Error creating default employee:', error);
      return {
        success: false,
        error: 'Failed to create default employee',
        code: 500
      };
    }
  }
};

export default employeeService;