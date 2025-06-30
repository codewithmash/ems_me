
import sql from 'mssql';
import { pool } from '../config/db';

export const shiftService = {
  getAllShifts: async () => {
    try {
      const result = await pool.request().query('SELECT * FROM shifts');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }
  },
  
  getShiftById: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM shifts WHERE id = @id');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching shift by id:', error);
      throw error;
    }
  },
  
  createShift: async (shift: any) => {
    try {
      const { name, startTime, endTime } = shift;
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('startTime', sql.Time, startTime)
        .input('endTime', sql.Time, endTime)
        .input('createdAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO shifts (name, startTime, endTime, createdAt)
          OUTPUT INSERTED.id
          VALUES (@name, @startTime, @endTime, @createdAt)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating shift:', error);
      throw error;
    }
  },
  
  updateShift: async (id: number, shift: any) => {
    try {
      const { name, startTime, endTime } = shift;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('startTime', sql.Time, startTime)
        .input('endTime', sql.Time, endTime)
        .query(`
          UPDATE shifts 
          SET name = @name, startTime = @startTime, endTime = @endTime 
          WHERE id = @id
        `);
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  },
  
  deleteShift: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM shifts WHERE id = @id');
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  }
};

export default shiftService;
