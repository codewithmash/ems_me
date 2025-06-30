
import express from 'express';
import sql from 'mssql';
import { pool } from '../config/db';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if we have any employees table entries
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT * FROM employees 
        WHERE email = @email
      `);

    const user = result.recordset[0];

    // If no user found
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // In production, you would use bcrypt to compare passwords
    // This is simplified for the example
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check user role
    let isAdmin = false;
    let role = 'user';
    
    if (user.role === 'superadmin') {
      isAdmin = true;
      role = 'superadmin';
    } else if (user.role === 'admin') {
      isAdmin = true;
      role = 'admin';
    }

    // Create user object to return (don't include password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin,
      role
    };

    // In a real app, you would generate and return a JWT token here

    res.json({
      user: userData,
      message: 'Login successful'
    });

  } catch (error) {
    next(error);
  }
});

// Fallback admin login for development/testing
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  // Superadmin credentials
  if (email === 'superadmin@example.com' && password === 'super123') {
    return res.json({
      user: {
        id: 999,
        email: 'superadmin@example.com',
        name: 'Super Admin User',
        isAdmin: true,
        role: 'superadmin'
      },
      message: 'Login successful'
    });
  }
  
  // Regular admin credentials
  if (email === 'admin@example.com' && password === 'admin123') {
    return res.json({
      user: {
        id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true,
        role: 'admin'
      },
      message: 'Login successful'
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
