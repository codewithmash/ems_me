import mysql from 'mysql2/promise';
import { pool } from '../config/db.js';

async function getLocationName(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.address) {
      return data.display_name;
    } else {
      throw new Error("Location not found");
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}

export const departmentService = {
  getAllDepartments: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM departments');
      return rows;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  getDepartmentById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching department by id:', error);
      throw error;
    }
  },

  createDepartment: async (department) => {
    let connection;
    try {
      const { name, description, coordinates } = department;
      const location = await getLocationName(coordinates[0].lat, coordinates[0].lng);
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO departments (name, description, location, coordinates, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [name, description, location, JSON.stringify(coordinates), new Date()]
      );

      await connection.commit();
      return { id: result.insertId, ...department };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error creating department:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  updateDepartment: async (id, department) => {
    let connection;
    try {
      let { name, description, coordinates } = department;

      if (typeof coordinates === 'string') {
        coordinates = JSON.parse(coordinates);
      }

      const location = await getLocationName(coordinates[0].lat, coordinates[0].lng);
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      await connection.query(
        `UPDATE departments
         SET name = ?, description = ?, location = ?, coordinates = ?
         WHERE id = ?`,
        [name, description, location, JSON.stringify(coordinates), id]
      );

      await connection.commit();
      return { id, ...department };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error updating department:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  deleteDepartment: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },

  getDepartmentEmployees: async (departmentId) => {
    try {
      // First get the department name
      const [deptRows] = await pool.query(
        'SELECT name FROM departments WHERE id = ?',
        [departmentId]
      );

      if (!deptRows || deptRows.length === 0) {
        return [];
      }

      const deptName = deptRows[0].name;

      // Then get employees in that department
      const [employeeRows] = await pool.query(
        'SELECT * FROM users WHERE department = ?',
        [deptName]
      );

      return employeeRows;
    } catch (error) {
      console.error('Error fetching department employees:', error);
      throw error;
    }
  },

  assignEmployeeToDepartment: async (departmentId, data) => {
    let connection;
    try {
      const { employeeId, designation, deptName } = data;
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        'UPDATE users SET department = ? WHERE id = ?',
        [deptName, employeeId.employeeId]
      );

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error assigning employee to department:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
};

export default departmentService;