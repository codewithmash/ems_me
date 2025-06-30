
import sql from 'mssql';
import { pool } from '../config/db';

export const attendanceService = {
  getAllAttendance: async () => {
    try {
      const result = await pool.request().query(`
        SELECT a.*, e.name as employeeName 
        FROM attendance a
        LEFT JOIN users e ON a.employeeId = e.employeeId
      `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },
  
  getAttendanceByDate: async (date: string) => {
    try {
      const result = await pool.request()
        .input('date', sql.Date, date)
        .query(`
          SELECT a.*, e.name as employeeName 
          FROM attendance a
          LEFT JOIN users e ON a.employeeId = e.employeeId
          WHERE CONVERT(DATE, a.date) = CONVERT(DATE, @date)
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      throw error;
    }
  },
  
  createAttendance: async (attendance: any) => {
    try {
      const { employeeId, date, status, checkInTime, checkOutTime } = attendance;
      const result = await pool.request()
        .input('employeeId', sql.NVarChar, employeeId)
        .input('date', sql.Date, date)
        .input('status', sql.NVarChar, status)
        .input('checkInTime', sql.Time, checkInTime)
        .input('checkOutTime', sql.Time, checkOutTime)
        .input('createdAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO attendance (employeeId, date, status, checkInTime, checkOutTime, createdAt)
          OUTPUT INSERTED.id
          VALUES (@employeeId, @date, @status, @checkInTime, @checkOutTime, @createdAt)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },
  
  updateAttendance: async (id: number, attendance: any) => {
    try {
      const { employeeId, date, status, checkInTime, checkOutTime } = attendance;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('employeeId', sql.NVarChar, employeeId)
        .input('date', sql.Date, date)
        .input('status', sql.NVarChar, status)
        .input('checkInTime', sql.Time, checkInTime)
        .input('checkOutTime', sql.Time, checkOutTime)
        .query(`
          UPDATE attendance 
          SET employeeId = @employeeId, date = @date, status = @status, 
              checkInTime = @checkInTime, checkOutTime = @checkOutTime 
          WHERE id = @id
        `);
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }
};

export default attendanceService;
