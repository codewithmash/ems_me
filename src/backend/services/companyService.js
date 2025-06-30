import mysql from 'mysql2/promise';
import { pool } from '../config/db.js';

export const companyService = {
  getAllCompanies: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM companies');
      return rows;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },
  
  getCompanyById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching company by id:', error);
      throw error;
    }
  },
  
  createCompany: async (company) => {
    try {
      const { name, contactNo, adminName, adminEmail, adminLoginId, multipleDeviceAllowed } = company;
      const createdAt = new Date();
      
      const [result] = await pool.query(
        `INSERT INTO companies 
        (name, contactNo, adminName, adminEmail, adminLoginId, multipleDeviceAllowed, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, contactNo, adminName, adminEmail, adminLoginId, multipleDeviceAllowed, createdAt]
      );
      
      return { id: result.insertId };
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },
  
  updateCompany: async (id, company) => {
    try {
      const { name, contactNo, adminName, adminEmail, adminLoginId, multipleDeviceAllowed } = company;
      
      const [result] = await pool.query(
        `UPDATE companies 
        SET name = ?, contactNo = ?, adminName = ?, 
            adminEmail = ?, adminLoginId = ?, multipleDeviceAllowed = ? 
        WHERE id = ?`,
        [name, contactNo, adminName, adminEmail, adminLoginId, multipleDeviceAllowed, id]
      );
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },
  
  deleteCompany: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM companies WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }
};

export default companyService;