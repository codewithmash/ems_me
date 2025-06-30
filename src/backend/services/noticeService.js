import { pool } from '../config/db.js';

export const noticeService = {
  getAllNotices: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  },

  createNotice: async (notice) => {
    try {
      const { title, content } = notice;
      const createdAt = new Date();

      const [result] = await pool.query(
        `INSERT INTO notifications (title, description, created_at, updatedAt)
         VALUES (?, ?, ?, ?)`,
        [title, content, createdAt, createdAt]
      );

      return { id: result.insertId, title, content };
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  },

  updateNotice: async (id, notice) => {
    try {
      const { title, content } = notice;

      await pool.query(
        `UPDATE notifications SET title = ?, description = ? WHERE id = ?`,
        [title, content, id]
      );

      return { id, title, content };
    } catch (error) {
      console.error('Error updating notice:', error);
      throw error;
    }
  },

  deleteNotice: async (id) => {
    try {
      await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting notice:', error);
      throw error;
    }
  }
};

export default noticeService;
// This module provides services for managing notices in the application.
// It includes functions to get all notices, create a new notice, update an existing notice,
// and delete a notice. Each function interacts with the database using SQL queries.
// The `pool` object is used to execute queries against the MySQL database.
// Errors are logged to the console, and exceptions are thrown to be handled by the calling code.
// The service is exported as `noticeService` for use in other parts of the application.  