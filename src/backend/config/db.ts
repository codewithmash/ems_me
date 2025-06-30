import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔄 Starting MySQL pool...');

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_php_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testConnection() {
  try {
    console.log('🔁 Pinging database...');
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL connection successful');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
}

// Run test if this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testConnection();
}
