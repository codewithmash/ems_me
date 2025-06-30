// This file provides a mock database service for frontend development
// In production, these operations should be handled by backend API calls

// Utility to get data from localStorage or return default
const getStoredData = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

// Utility to save data to localStorage
const saveData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Flag to determine if we're using mock or real backend
// For the browser environment, we'll always use mock
const useMock = true; // In production with a real backend, this could be conditionally set

// Try to import backend services (will fail in browser environment)
let backendServices: any = null;

// This will be skipped in the browser environment
if (!useMock && typeof window === 'undefined') {
  try {
    // This would work in a Node.js environment
    backendServices = require('../backend/index');
  } catch (error) {
    console.warn('Backend services not available, using mock data');
  }
}

// Mock database query function
export async function query(sql: string, params?: any[]) {
  //console.log('Mock DB Query:', sql, params);
  // In a real implementation, this would make an API call to your backend
  return [];
}

// Mock services for frontend development

// Company table operations
export const companyQueries = {
  getAllCompanies: async () => {
    return getStoredData('companies', []);
  },
  
  getCompanyById: async (id: number) => {
    const companies = getStoredData('companies', []);
    return companies.filter((company: any) => company.id === id);
  },
  
  createCompany: async (company: any) => {
    const companies = getStoredData('companies', []);
    const newCompany = {
      id: companies.length > 0 ? Math.max(...companies.map((c: any) => c.id)) + 1 : 1,
      ...company,
      createdAt: new Date().toISOString()
    };
    
    companies.push(newCompany);
    saveData('companies', companies);
    return { insertId: newCompany.id };
  },
  
  updateCompany: async (id: number, company: any) => {
    const companies = getStoredData('companies', []);
    const index = companies.findIndex((c: any) => c.id === id);
    
    if (index !== -1) {
      companies[index] = { ...companies[index], ...company };
      saveData('companies', companies);
    }
    return { affectedRows: index !== -1 ? 1 : 0 };
  },
  
  deleteCompany: async (id: number) => {
    const companies = getStoredData('companies', []);
    const filteredCompanies = companies.filter((c: any) => c.id !== id);
    saveData('companies', filteredCompanies);
    return { affectedRows: companies.length - filteredCompanies.length };
  }
};

// Location table operations
export const locationQueries = {
  getAllLocations: async () => {
    return getStoredData('locations', []);
  },
  
  getLocationById: async (id: number) => {
    const locations = getStoredData('locations', []);
    return locations.filter((location: any) => location.id === id);
  },
  
  createLocation: async (location: any) => {
    const locations = getStoredData('locations', []);
    const newLocation = {
      id: locations.length > 0 ? Math.max(...locations.map((l: any) => l.id)) + 1 : 1,
      ...location,
      createdAt: new Date().toISOString()
    };
    
    locations.push(newLocation);
    saveData('locations', locations);
    return { insertId: newLocation.id };
  },
  
  updateLocation: async (id: number, location: any) => {
    const locations = getStoredData('locations', []);
    const index = locations.findIndex((l: any) => l.id === id);
    
    if (index !== -1) {
      locations[index] = { ...locations[index], ...location };
      saveData('locations', locations);
    }
    return { affectedRows: index !== -1 ? 1 : 0 };
  },
  
  deleteLocation: async (id: number) => {
    const locations = getStoredData('locations', []);
    const filteredLocations = locations.filter((l: any) => l.id !== id);
    saveData('locations', filteredLocations);
    return { affectedRows: locations.length - filteredLocations.length };
  }
};

// Shift table operations
export const shiftQueries = {
  getAllShifts: async () => {
    return getStoredData('shifts', []);
  },
  
  getShiftById: async (id: number) => {
    const shifts = getStoredData('shifts', []);
    return shifts.filter((shift: any) => shift.id === id);
  },
  
  createShift: async (shift: any) => {
    const shifts = getStoredData('shifts', []);
    const newShift = {
      id: shifts.length > 0 ? Math.max(...shifts.map((s: any) => s.id)) + 1 : 1,
      ...shift,
      createdAt: new Date().toISOString()
    };
    
    shifts.push(newShift);
    saveData('shifts', shifts);
    return { insertId: newShift.id };
  },
  
  updateShift: async (id: number, shift: any) => {
    const shifts = getStoredData('shifts', []);
    const index = shifts.findIndex((s: any) => s.id === id);
    
    if (index !== -1) {
      shifts[index] = { ...shifts[index], ...shift };
      saveData('shifts', shifts);
    }
    return { affectedRows: index !== -1 ? 1 : 0 };
  },
  
  deleteShift: async (id: number) => {
    const shifts = getStoredData('shifts', []);
    const filteredShifts = shifts.filter((s: any) => s.id !== id);
    saveData('shifts', filteredShifts);
    return { affectedRows: shifts.length - filteredShifts.length };
  }
};

// Project table operations
export const projectQueries = {
  getAllProjects: async () => {
    const projects = getStoredData('projects', []);
    const locations = getStoredData('locations', []);
    
    return projects.map((project: any) => {
      const location = locations.find((l: any) => l.id === project.locationId);
      return {
        ...project,
        locationName: location ? location.name : 'Unknown'
      };
    });
  },
  
  getProjectById: async (id: number) => {
    const projects = getStoredData('projects', []);
    const locations = getStoredData('locations', []);
    
    const project = projects.find((p: any) => p.id === id);
    if (!project) return null;
    
    const location = locations.find((l: any) => l.id === project.locationId);
    return {
      ...project,
      locationName: location ? location.name : 'Unknown'
    };
  },
  
  getProjectEmployees: async (projectId: number) => {
    const projectEmployees = getStoredData('project_employees', []);
    const employees = getStoredData('employees', []);
    
    const relationData = projectEmployees.filter((pe: any) => pe.projectId === projectId);
    
    return relationData.map((rel: any) => {
      const employee = employees.find((e: any) => e.id === rel.employeeId);
      return {
        ...employee,
        designation: rel.designation
      };
    });
  },
  
  createProject: async (project: any) => {
    const projects = getStoredData('projects', []);
    const newProject = {
      id: projects.length > 0 ? Math.max(...projects.map((p: any) => p.id)) + 1 : 1,
      ...project,
      createdAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    saveData('projects', projects);
    return { insertId: newProject.id };
  },
  
  updateProject: async (id: number, project: any) => {
    const projects = getStoredData('projects', []);
    const index = projects.findIndex((p: any) => p.id === id);
    
    if (index !== -1) {
      projects[index] = { ...projects[index], ...project };
      saveData('projects', projects);
    }
    return { affectedRows: index !== -1 ? 1 : 0 };
  },
  
  deleteProject: async (id: number) => {
    // Delete project employees first
    const projectEmployees = getStoredData('project_employees', []);
    const filteredProjectEmployees = projectEmployees.filter((pe: any) => pe.projectId !== id);
    saveData('project_employees', filteredProjectEmployees);
    
    // Then delete the project
    const projects = getStoredData('projects', []);
    const filteredProjects = projects.filter((p: any) => p.id !== id);
    saveData('projects', filteredProjects);
    
    return { affectedRows: projects.length - filteredProjects.length };
  },
  
  assignEmployeeToProject: async (projectId: number, employeeId: number, designation: string) => {
    const projectEmployees = getStoredData('project_employees', []);
    
    // Check if relationship already exists
    const existing = projectEmployees.find(
      (pe: any) => pe.projectId === projectId && pe.employeeId === employeeId
    );
    
    if (!existing) {
      const newRelation = {
        id: projectEmployees.length > 0 ? Math.max(...projectEmployees.map((pe: any) => pe.id)) + 1 : 1,
        projectId,
        employeeId,
        designation,
        assignedAt: new Date().toISOString()
      };
      
      projectEmployees.push(newRelation);
      saveData('project_employees', projectEmployees);
      return { affectedRows: 1 };
    }
    
    return { affectedRows: 0 };
  },
  
  removeEmployeeFromProject: async (projectId: number, employeeId: number) => {
    const projectEmployees = getStoredData('project_employees', []);
    const filteredRelations = projectEmployees.filter(
      (pe: any) => !(pe.projectId === projectId && pe.employeeId === employeeId)
    );
    
    saveData('project_employees', filteredRelations);
    return { affectedRows: projectEmployees.length - filteredRelations.length };
  }
};

// Attendance table operations
export const attendanceQueries = {
  getAllAttendance: async () => {
    const attendance = getStoredData('attendance', []);
    const employees = getStoredData('employees', []);
    
    return attendance.map((a: any) => {
      const employee = employees.find((e: any) => e.employeeId === a.employeeId);
      return {
        ...a,
        employeeName: employee ? employee.name : 'Unknown'
      };
    });
  },
  
  getAttendanceByDate: async (date: string) => {
    const attendance = getStoredData('attendance', []);
    const employees = getStoredData('employees', []);
    
    const filteredAttendance = attendance.filter(
      (a: any) => a.date.substring(0, 10) === date
    );
    
    return filteredAttendance.map((a: any) => {
      const employee = employees.find((e: any) => e.employeeId === a.employeeId);
      return {
        ...a,
        employeeName: employee ? employee.name : 'Unknown'
      };
    });
  },
  
  createAttendance: async (attendance: any) => {
    const attendanceRecords = getStoredData('attendance', []);
    const newAttendance = {
      id: attendanceRecords.length > 0 ? Math.max(...attendanceRecords.map((a: any) => a.id)) + 1 : 1,
      ...attendance,
      createdAt: new Date().toISOString()
    };
    
    attendanceRecords.push(newAttendance);
    saveData('attendance', attendanceRecords);
    return { insertId: newAttendance.id };
  },
  
  updateAttendance: async (id: number, attendance: any) => {
    const attendanceRecords = getStoredData('attendance', []);
    const index = attendanceRecords.findIndex((a: any) => a.id === id);
    
    if (index !== -1) {
      attendanceRecords[index] = { ...attendanceRecords[index], ...attendance };
      saveData('attendance', attendanceRecords);
    }
    return { affectedRows: index !== -1 ? 1 : 0 };
  }
};

// Employee table operations
export const employeeQueries = {
  getAllEmployees: async () => {
    return getStoredData('employees', []);
  },
  
  getEmployeeById: async (id: number) => {
    const employees = getStoredData('employees', []);
    return employees.filter((employee: any) => employee.id === id);
  },
  
  createEmployee: async (employee: any) => {
    const employees = getStoredData('employees', []);
    const newEmployee = {
      id: employees.length > 0 ? Math.max(...employees.map((e: any) => e.id)) + 1 : 1,
      ...employee,
      createdAt: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    saveData('employees', employees);
    return { insertId: newEmployee.id };
  },
  
  updateEmployee: async (id: number, employee: any) => {
    const employees = getStoredData('employees', []);
    const index = employees.findIndex((e: any) => e.id === id);
    
    if (index !== -1) {
      employees[index] = { ...employees[index], ...employee };
      saveData('employees', employees);
    }
    return { affectedRows: index !== -1 ? 1 : 0 };
  },
  
  deleteEmployee: async (id: number) => {
    const employees = getStoredData('employees', []);
    const filteredEmployees = employees.filter((e: any) => e.id !== id);
    saveData('employees', filteredEmployees);
    return { affectedRows: employees.length - filteredEmployees.length };
  }
};

// Initialize database schema
export async function initDbSchema() {
  try {
    //console.log('Initializing browser database...');
    
    // Initialize empty collections if they don't exist
    if (!localStorage.getItem('companies')) saveData('companies', []);
    if (!localStorage.getItem('locations')) saveData('locations', []);
    if (!localStorage.getItem('shifts')) saveData('shifts', []);
    if (!localStorage.getItem('employees')) saveData('employees', []);
    if (!localStorage.getItem('attendance')) saveData('attendance', []);
    if (!localStorage.getItem('projects')) saveData('projects', []);
    if (!localStorage.getItem('project_employees')) saveData('project_employees', []);
    
    //console.log('Browser database initialized successfully.');
  } catch (error) {
    console.error('Error initializing browser database:', error);
    throw error;
  }
}

export default {
  query,
  companyQueries,
  locationQueries,
  shiftQueries,
  attendanceQueries,
  employeeQueries,
  projectQueries,
  initDbSchema
};
