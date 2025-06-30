
import { testConnection } from './config/db.js';
import companyService from './services/companyService.js';
import locationService from './services/locationService.js';
import shiftService from './services/shiftService.js';
import employeeService from './services/employeeService.js';
import attendanceService from './services/attendanceService.js';
import projectService from './services/projectService.js';

// Initialize the database connection
const initBackend = async () => {
  try {
    await testConnection();
    //console.log('Backend services initialized');
  } catch (error) {
    console.error('Failed to initialize backend services:', error);
  }
};

// SQL creation scripts for tables (can be used when implementing a real setup)
const dbSchemaScripts = {
  createCompaniesTable: `
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'companies')
    BEGIN
      CREATE TABLE companies (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        contactNo NVARCHAR(20) NOT NULL,
        adminName NVARCHAR(100) NOT NULL,
        adminEmail NVARCHAR(100) NOT NULL,
        adminLoginId NVARCHAR(50) NOT NULL,
        multipleDeviceAllowed BIT DEFAULT 0,
        createdAt DATETIME NOT NULL
      )
    END
  `,
  createLocationsTable: `
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'locations')
    BEGIN
      CREATE TABLE locations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 6) NOT NULL,
        longitude DECIMAL(10, 6) NOT NULL,
        radius INT NOT NULL,
        createdAt DATETIME NOT NULL
      )
    END
  `,
  createShiftsTable: `
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'shifts')
    BEGIN
      CREATE TABLE shifts (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        createdAt DATETIME NOT NULL
      )
    END
  `,
  createEmployeesTable: `
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employees')
    BEGIN
      CREATE TABLE employees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employeeId NVARCHAR(50) UNIQUE NOT NULL,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL,
        phone NVARCHAR(20) NOT NULL,
        project NVARCHAR(100) NOT NULL,
        location NVARCHAR(100) NOT NULL,
        createdAt DATETIME NOT NULL
      )
    END
  `,
  createAttendanceTable: `
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'attendance')
    BEGIN
      CREATE TABLE attendance (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employeeId NVARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        status NVARCHAR(20) NOT NULL,
        checkInTime TIME NULL,
        checkOutTime TIME NULL,
        createdAt DATETIME NOT NULL,
        CONSTRAINT FK_attendance_employees FOREIGN KEY (employeeId) 
        REFERENCES employees(employeeId)
      )
    END
  `,
  createProjectsTable: `
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'projects')
    BEGIN
      CREATE TABLE projects (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(MAX) NULL,
        locationId INT NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NULL,
        status NVARCHAR(20) NOT NULL,
        createdAt DATETIME NOT NULL,
        CONSTRAINT FK_projects_locations FOREIGN KEY (locationId)
        REFERENCES locations(id)
      )
    END
  `,
  createProjectEmployeesTable: `
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'project_employees')
    BEGIN
      CREATE TABLE project_employees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        projectId INT NOT NULL,
        employeeId INT NOT NULL,
        designation NVARCHAR(100) NOT NULL,
        assignedAt DATETIME NOT NULL,
        CONSTRAINT FK_project_employees_projects FOREIGN KEY (projectId)
        REFERENCES projects(id),
        CONSTRAINT FK_project_employees_employees FOREIGN KEY (employeeId)
        REFERENCES employees(id),
        CONSTRAINT UQ_project_employee UNIQUE (projectId, employeeId)
      )
    END
  `
};

export {
  initBackend,
  dbSchemaScripts,
  companyService,
  locationService,
  shiftService,
  employeeService,
  attendanceService,
  projectService
};
