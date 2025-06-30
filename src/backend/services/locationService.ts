
import sql from 'mssql';
import { pool } from '../config/db';

export const locationService = {
  getAllLocations: async () => {
    try {
      const result = await pool.request().query('SELECT * FROM locations');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
  
  getLocationById: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM locations WHERE id = @id');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching location by id:', error);
      throw error;
    }
  },
  
  createLocation: async (location: any) => {
    try {
      const { name, latitude, longitude, radius } = location;
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('latitude', sql.Decimal(10, 6), latitude)
        .input('longitude', sql.Decimal(10, 6), longitude)
        .input('radius', sql.Int, radius)
        .input('createdAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO locations (name, latitude, longitude, radius, createdAt)
          OUTPUT INSERTED.id
          VALUES (@name, @latitude, @longitude, @radius, @createdAt)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },
  
  updateLocation: async (id: number, location: any) => {
    try {
      const { name, latitude, longitude, radius } = location;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('latitude', sql.Decimal(10, 6), latitude)
        .input('longitude', sql.Decimal(10, 6), longitude)
        .input('radius', sql.Int, radius)
        .query(`
          UPDATE locations 
          SET name = @name, latitude = @latitude, longitude = @longitude, radius = @radius 
          WHERE id = @id
        `);
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },
  
  deleteLocation: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM locations WHERE id = @id');
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
};

export default locationService;
