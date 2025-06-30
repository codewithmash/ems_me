import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { testConnection } from './config/db';
import companyRoutes from './routes/companyRoutes';
import locationRoutes from './routes/locationRoutes';
import shiftRoutes from './routes/shiftRoutes';
import employeeRoutes from './routes/employeeRoutes';
import projectRoutes from './routes/projectRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import authRoutes from './routes/authRoutes';
import noticeRoutes from './routes/noticeRoutes';
import departmentRoutes from './routes/departmentRoutes';
import leaveRoutes from './routes/leaveRoutes';
import designationRoutes from './routes/designationRoutes';
import { ErrorResponse } from './types';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
testConnection().then((connected) => {
  if (connected) {
    //console.log('Connected to database');
  } else {
    console.error('Failed to connect to database');
  }
});

// Routes
app.use('/api/companies', companyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/designations', designationRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  //console.log(`Server running on port ${PORT}`);
});

export default app;
