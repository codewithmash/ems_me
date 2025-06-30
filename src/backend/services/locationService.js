import { pool } from '../config/db.js';

export const locationService = {
  getAllLocations: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM locations');
      return rows;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
  
  getLocationById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM locations WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching location by id:', error);
      throw error;
    }
  },
  
  createLocation: async (location) => {
    try {
      const { name, latitude, longitude, radius } = location;
      const createdAt = new Date();
      
      const [result] = await pool.query(
        `INSERT INTO locations (name, latitude, longitude, radius, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [name, latitude, longitude, radius, createdAt]
      );
      
      return { id: result.insertId };
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },
  
  updateLocation: async (id, location) => {
    try {
      const { name, latitude, longitude, radius } = location;
      
      const [result] = await pool.query(
        `UPDATE locations 
         SET name = ?, latitude = ?, longitude = ?, radius = ?
         WHERE id = ?`,
        [name, latitude, longitude, radius, id]
      );
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },
  
  deleteLocation: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM locations WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
};

export default locationService;