import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// MySQL database connection configuration
export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
export const pool = mysql.createPool(dbConfig);

// Utility to check and create tables
async function ensureTableExists(tableName, createTableSQL) {
  const checkQuery = `
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = '${process.env.DB_NAME}' 
    AND table_name = '${tableName}'
  `;
  
  const [rows] = await pool.query(checkQuery);
  if (rows[0].count === 0) {
    await pool.query(createTableSQL);
    console.log(`Table '${tableName}' created.`);
  } else {
    console.log(`Table '${tableName}' already exists.`);
  }
}

// All table definitions
const TABLE_DEFINITIONS = [
  {
    name: 'users',
    sql: `
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        otp VARCHAR(255),
        otp_expiry DATETIME,
        project_assigned VARCHAR(255),
        department VARCHAR(255),
        today_checkin_time VARCHAR(255),
        today_checkout_time VARCHAR(255),
        checkpoint TEXT,
        is_face_registered BOOLEAN,
        phone VARCHAR(255),
        isMultipleDeviceAllowed BOOLEAN,
        devicesInfo TEXT,
        role VARCHAR(255),
        face_data TEXT,
        face_data_base_64 TEXT,
        today_checkin_lat VARCHAR(255),
        today_check_long VARCHAR(255),
        leave_status ENUM('on_leave', 'not_on_leave', 'pending') DEFAULT 'not_on_leave',
        availability BOOLEAN DEFAULT TRUE,
        shift VARCHAR(100),
        location VARCHAR(255),
        face_data_status VARCHAR(255),
        coordinates TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'attendance_records',
    sql: `
      CREATE TABLE attendance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        checkinTime VARCHAR(255),
        checkoutTime VARCHAR(255),
        status VARCHAR(255),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `
  },
  {
    name: 'leave_histories',
    sql: `
      CREATE TABLE leave_histories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reason VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('approved', 'rejected', 'pending') DEFAULT 'pending',
        approval_date DATE,
        leave_type ENUM('sick', 'vacation', 'emergency', 'other'),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `
  },
  {
    name: 'notifications',
    sql: `
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `
  },
  {
    name: 'departments',
    sql: `
      CREATE TABLE departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        coordinates TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'projects',
    sql: `
      CREATE TABLE projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'shifts',
    sql: `
      CREATE TABLE shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        start_time VARCHAR(50),
        end_time VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
  }
];

// Test database connection and setup tables
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('Database connection successful');
    
    // Ensure all tables exist
    for (const table of TABLE_DEFINITIONS) {
      await ensureTableExists(table.name, table.sql);
    }

    console.log('All tables have been verified/created');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default {
  pool,
  testConnection
};