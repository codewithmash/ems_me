import { pool } from '../config/db.js';

const convertTimeStringToDate = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const shiftService = {
  getAllShifts: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM shifts');
      return rows;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }
  },
  
  getShiftById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM shifts WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching shift by id:', error);
      throw error;
    }
  },
  
  createShift: async (shift) => {
    try {
      const { name, startTime, endTime } = shift;
      const createdAt = new Date();
      
      const [result] = await pool.query(
        `INSERT INTO shifts (name, startTime, endTime, createdAt)
         VALUES (?, ?, ?, ?)`,
        [name, startTime, endTime, createdAt]
      );
      
      return { id: result.insertId };
    } catch (error) {
      console.error('Error creating shift:', error);
      throw error;
    }
  },
  
  updateShift: async (id, shift) => {
    try {
      const { name, startTime, endTime } = shift;
      
      const [result] = await pool.query(
        `UPDATE shifts 
         SET name = ?, startTime = ?, endTime = ?
         WHERE id = ?`,
        [name, startTime, endTime, id]
      );
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  },
  
  deleteShift: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM shifts WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  }
};

export default shiftService;