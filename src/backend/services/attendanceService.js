import { pool } from '../config/db.js';

export const attendanceService = {
  getAllAttendance: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT a.*, e.name as employeeName 
        FROM attendance_records a
        LEFT JOIN users e ON a.employee_id = e.employee_id
      `);
      return rows;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },
  
  getAttendanceByDate: async (date) => {
    try {
      const [rows] = await pool.query(`
        SELECT a.*, e.name as employeeName 
        FROM attendance_records a
        LEFT JOIN users e ON a.employee_id = e.employee_id
        WHERE DATE(a.date) = DATE(?)
      `, [date]);
      return rows;
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      throw error;
    }
  },
  
  createAttendance: async (attendance) => {
    try {
      const { employeeId, date, status, checkInTime, checkOutTime } = attendance;
      const [result] = await pool.query(`
        INSERT INTO attendance_records 
        (employee_id, date, status, checkinTime, checkoutTime, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        employeeId, 
        date, 
        status, 
        checkInTime, 
        checkOutTime, 
        new Date()
      ]);
      
      return { id: result.insertId };
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },
  
  updateAttendance: async (id, attendance) => {
    try {
      const { employeeId, date, status, checkInTime, checkOutTime } = attendance;
      const [result] = await pool.query(`
        UPDATE attendance_records 
        SET employee_id = ?, date = ?, status = ?, 
            checkinTime = ?, checkoutTime = ? 
        WHERE id = ?
      `, [
        employeeId, 
        date, 
        status, 
        checkInTime, 
        checkOutTime, 
        id
      ]);
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  getAttendanceByEmployeeid: async (employee_id) => {
    try {
      const [rows] = await pool.query(`
        SELECT a.*, e.name AS employeeName 
        FROM attendance_records a
        LEFT JOIN users e ON a.employee_id = e.employee_id
        WHERE e.employee_id = ?
      `, [employee_id]);
      
      return rows;
    } catch (error) {
      console.error('Error fetching attendance by employee ID:', error);
      throw error;
    }
  },
};

export default attendanceService;