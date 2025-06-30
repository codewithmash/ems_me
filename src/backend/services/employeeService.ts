
import sql from 'mssql';
import { pool } from '../config/db';



async function getLocationName(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.address) {
      return data.display_name; // The location name
    } else {
      throw new Error("Location not found");
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}

export const employeeService = {
  getAllEmployees: async () => {
    try {
      const result = await pool.request().query('SELECT * FROM employees');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
  
  getEmployeeById: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM employees WHERE id = @id');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching employee by id:', error);
      throw error;
    }
  },
  
  createEmployee: async (employee: any) => {
    try {
      const { name, email, phone, project, location, employeeId, password, role, locationCoordinates } = employee;
      const result = await pool.request()
        .input('employeeId', sql.NVarChar, employeeId || `EMP${Math.floor(Math.random() * 10000)}`)
        .input('name', sql.NVarChar, name)
        .input('email', sql.NVarChar, email)
        .input('phone', sql.NVarChar, phone)
        .input('project', sql.NVarChar, project)
        .input('location', sql.NVarChar, location)
        .input('password', sql.NVarChar, password || Math.random().toString(36).slice(-8))
        .input('role', sql.NVarChar, role || 'normal')
        .input('locationCoordinates', sql.NVarChar, locationCoordinates ? JSON.stringify(locationCoordinates) : null)
        .input('createdAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO employees (employeeId, name, email, phone, project, location, password, role, locationCoordinates, createdAt)
          OUTPUT INSERTED.id
          VALUES (@employeeId, @name, @email, @phone, @project, @location, @password, @role, @locationCoordinates, @createdAt)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },
  
  updateEmployee: async (id: number, employee: any) => {
    try {
      const { name, email, phone, project, location, allowMultipleDevices, role, locationCoordinates, password } = employee;
      
      // Build the query dynamically based on whether password is being updated
      let queryFields = 'name = @name, email = @email, phone = @phone, project = @project, location = @location, allowMultipleDevices = @allowMultipleDevices, role = @role';
      
      if (locationCoordinates) {
        queryFields += ', locationCoordinates = @locationCoordinates';
      }
      
      if (password) {
        queryFields += ', password = @password';
      }
      
      const request = pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('email', sql.NVarChar, email)
        .input('phone', sql.NVarChar, phone)
        .input('project', sql.NVarChar, project)
        .input('location', sql.NVarChar, location)
        .input('allowMultipleDevices', sql.Bit, allowMultipleDevices)
        .input('role', sql.NVarChar, role);
      
      if (locationCoordinates) {
        request.input('locationCoordinates', sql.NVarChar, JSON.stringify(locationCoordinates));
      }
      
      if (password) {
        request.input('password', sql.NVarChar, password);
      }
      
      const result = await request.query(`
        UPDATE employees 
        SET ${queryFields}
        WHERE id = @id
      `);
      
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },
  
  deleteEmployee: async (id: number) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM employees WHERE id = @id');
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },
  
  changePassword: async (id: number, newPassword: string) => {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('password', sql.NVarChar, newPassword)
        .query('UPDATE employees SET password = @password WHERE id = @id');
      return result.rowsAffected[0];
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};

export default employeeService;
