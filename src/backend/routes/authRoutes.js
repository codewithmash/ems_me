import express from 'express';
import { pool } from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendOtpEmail, sendPasswordResetMail } from '../services/emailService.js';

const jwt_secret = "Mnb@#3490";
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const [rows] = await pool.query(`
      SELECT * FROM users 
      WHERE email = ?
    `, [email]);

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check user role
    let isAdmin = false;
    let role = 'user';
    
    if (user?.role === 'super_admin') {
      isAdmin = true;
      role = 'superadmin';
    } else if (user?.role === 'admin') {
      isAdmin = true;
      role = 'admin';
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: role 
      },
      jwt_secret,
      { expiresIn: '1h' }
    );

    // User data to return (without password)
    const userData = {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      isAdmin,
      role,
      token
    };

    res.json({
      user: userData,
      message: 'Login successful'
    });

  } catch (error) {
    next(error);
  }
});

// Admin login fallback
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  // Superadmin credentials
  if (email === 'superadmin@example.com' && password === 'super123') {
    const token = jwt.sign(
      { id: 999, email, role: 'superadmin' },
      jwt_secret,
      { expiresIn: '1h' }
    );
    return res.json({
      user: {
        id: 999,
        email: 'superadmin@example.com',
        name: 'Super Admin User',
        isAdmin: true,
        role: 'superadmin',
        token
      },
      message: 'Login successful'
    });
  }
  
  // Regular admin credentials
  if (email === 'admin@example.com' && password === 'admin123') {
    const token = jwt.sign(
      { id: 1, email, role: 'admin' },
      jwt_secret,
      { expiresIn: '1h' }
    );
    return res.json({
      user: {
        id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true,
        role: 'admin',
        token
      },
      message: 'Login successful'
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// OTP endpoints
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    
    const [rows] = await pool.query(`
      SELECT * FROM users 
      WHERE email = ?
    `, [email]);

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    await pool.query(`
      UPDATE users 
      SET otp = ? 
      WHERE email = ?
    `, [otp, email]);

    await sendOtpEmail(email, otp);

    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while sending OTP' });
  }
});

router.get("/validate-otp", async (req, res) => {
  try {
    const { email, otp } = req.query;

    const [rows] = await pool.query(`
      SELECT * FROM users 
      WHERE email = ?
    `, [email]);

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    if (user.otp == otp) {
      return res.json({ otp_validate_status: "success" });
    } else {
      return res.status(401).json({ 
        otp_validate_status: "failed", 
        message: "Incorrect OTP" 
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      otp_validate_status: "failed", 
      message: "Server error while validating OTP" 
    });
  }
});

// Password reset
router.put("/change-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(`
      UPDATE users 
      SET password = ? 
      WHERE email = ?
    `, [hashedPassword, email]);

    await sendPasswordResetMail(email);

    return res.json({ 
      status: "success",
      message: "Password updated successfully" 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      status: "error", 
      message: "Server error while changing password" 
    });
  }
});

export default router;