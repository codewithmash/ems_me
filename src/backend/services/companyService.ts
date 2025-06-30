
import sql from 'mssql';
import { pool } from '../config/db';

export const companyService = {
  getAllCompanies: async () => {
    try {
      const result = await pool.request().query('SELECT * FROM companies');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },
  
  getCompanyById: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM companies WHERE id = @id');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching company by id:', error);
      throw error;
    }
  },
  
  createCompany: async (company: any) => {
    try {
      const { name, contactNo, adminName, adminEmail, adminLoginId, multipleDeviceAllowed } = company;
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('contactNo', sql.NVarChar, contactNo)
        .input('adminName', sql.NVarChar, adminName)
        .input('adminEmail', sql.NVarChar, adminEmail)
        .input('adminLoginId', sql.NVarChar, adminLoginId)
        .input('multipleDeviceAllowed', sql.Bit, multipleDeviceAllowed)
        .input('createdAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO companies (name, contactNo, adminName, adminEmail, adminLoginId, multipleDeviceAllowed, createdAt)
          OUTPUT INSERTED.id
          VALUES (@name, @contactNo, @adminName, @adminEmail, @adminLoginId, @multipleDeviceAllowed, @createdAt)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },
  
  updateCompany: async (id: number, company: any) => {
    try {
      const { name, contactNo, adminName, adminEmail, adminLoginId, multipleDeviceAllowed } = company;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('contactNo', sql.NVarChar, contactNo)
        .input('adminName', sql.NVarChar, adminName)
        .input('adminEmail', sql.NVarChar, adminEmail)
        .input('adminLoginId', sql.NVarChar, adminLoginId)
        .input('multipleDeviceAllowed', sql.Bit, multipleDeviceAllowed)
        .query(`
          UPDATE companies 
          SET name = @name, contactNo = @contactNo, adminName = @adminName, 
              adminEmail = @adminEmail, adminLoginId = @adminLoginId, multipleDeviceAllowed = @multipleDeviceAllowed 
          WHERE id = @id
        `);
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },
  
  deleteCompany: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM companies WHERE id = @id');
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }
};

export default companyService;
