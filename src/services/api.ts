
// This file provides API services to connect the frontend to the backend

import { sendCredentialsEmail } from "@/utils/email";

// Base API URL - in production this would be your deployed backend URL
// const API_URL = import.meta.env.VITE_API_URL || 'http://154.38.160.45:5000';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for making API requests
const apiRequest = async (endpoint: string, options: Record<string, any> = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Company API functions
export const companyApi = {
  getAll: () => apiRequest('/companies'),
  getById: (id: number | string) => apiRequest(`/companies/${id}`),
  create: (data: any) => apiRequest('/companies', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/companies/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number | string) => apiRequest(`/companies/${id}`, { method: 'DELETE' })
};

// Location API functions
export const locationApi = {
  getAll: () => apiRequest('/locations'),
  getById: (id: number | string) => apiRequest(`/locations/${id}`),
  create: (data: any) => apiRequest('/locations', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/locations/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number | string) => apiRequest(`/locations/${id}`, { method: 'DELETE' })
};

// Shift API functions
export const shiftApi = {
  getAll: () => apiRequest('/shifts'),
  getById: (id: number | string) => apiRequest(`/shifts/${id}`),
  create: (data: any) => apiRequest('/shifts', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/shifts/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number | string) => apiRequest(`/shifts/${id}`, { method: 'DELETE' })
};

// Employee API functions
export const employeeApi = {
  getAll: () => apiRequest('/employees'),
  getById: (id: number | string) => apiRequest(`/employees/${id}`),
  create: (data: any) => apiRequest('/employees', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/employees/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number | string) => apiRequest(`/employees/${id}`, { method: 'DELETE' }),
  changePassword : (id: number | string,data: any)=> apiRequest(`/employees/${id}/change-password`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  updateMultipleDeviceAccess: (id: number | string, data: any) => 
    apiRequest(`/employees/${id}/update-multiple-access`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  updateEmployeeAccess: (id: number | string, data: any) => 
    apiRequest(`/employees/${id}/update-employee-access`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  approveOrRejectUser: (id: number | string, data: any) => 
    apiRequest(`/employees/${id}/approve-or-reject`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
};

// Project API functions
export const projectApi = {
  getAll: () => apiRequest('/projects'),
  getById: (id: number | string) => apiRequest(`/projects/${id}`),
  create: (data: any) => apiRequest('/projects', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/projects/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number | string) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),
  getProjectEmployees: (projectId: number | string) => apiRequest(`/projects/${projectId}/employees`),
  assignEmployee: (projectId: number | string, data: any) => apiRequest(
    `/projects/${projectId}/employees`, 
    { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }
  ),
  removeEmployee: (projectId: number | string, employeeId: number | string) => apiRequest(
    `/projects/${projectId}/employees/${employeeId}`, 
    { method: 'DELETE' }
  )
};

// Attendance API functions
export const attendanceApi = {
  getAll: () => apiRequest('/attendance'),
  getByDate: (date: string) => apiRequest(`/attendance/date/${date}`),
  getByEmployee: (employeeId: string) => apiRequest(`/attendance/employee/${employeeId}`),
  create: (data: any) => apiRequest('/attendance', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/attendance/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  // downloadpdf:(data) => apiRequest('/download-arabic-pdf',{
  //   method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(data)
  // })

  // downloadpdf: (data) => apiRequest('/download-arabic-pdf', {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //     responseType: 'blob' // Add this flag to indicate blob response
  //   }),

  // Replace your current downloadpdf with this direct approach:
downloadpdf: async (data) => {
  const response = await fetch(API_URL+'/download-arabic-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.blob(); // Returns blob, not JSON
}

};

// Auth API functions
export const authApi = {
  login: (credentials: any) => 
    apiRequest('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify(credentials) 
    }),

  sendOtp: (email: string) =>
    apiRequest('/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }),

  validateOtp: (email: string, otp: string | number) =>
    apiRequest(`/auth/validate-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
      method: 'GET'
    }),

  changePassword: (data: { email: string; password: string;}) =>
    apiRequest('/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
};


// Notice API functions
export const noticeApi = {
  getAll: () => apiRequest('/notices'),
  getById: (id: number | string) => apiRequest(`/notices/${id}`),
  create: (data: any) => apiRequest('/notices', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/notices/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number | string) => apiRequest(`/notices/${id}`, { method: 'DELETE' })
};

// Leave API functions
export const leaveApi = {
  getAll: () => apiRequest('/leaves'),
  getById: (id: number | string) => apiRequest(`/leaves/${id}`),
  getByEmployee: (employeeId: string) => apiRequest(`/leaves/employee/${employeeId}`),
  create: (data: any) => apiRequest('/leaves', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/leaves/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  updateStatus: (id: number | string, status: string, reason?: string) => apiRequest(`/leaves/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason })
  }),
  delete: (id: number | string) => apiRequest(`/leaves/${id}`, { method: 'DELETE' })
};

// Department API functions
export const departmentApi = {
  getAll: () => apiRequest('/departments'),
  getById: (id: number | string) => apiRequest(`/departments/${id}`),
  create: (data: any) => apiRequest('/departments', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/departments/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number | string) => apiRequest(`/departments/${id}`, { method: 'DELETE' }),
  getDepartmentEmployees: (departmentId: number | string) => apiRequest(`/departments/${departmentId}/employees`),
  assignEmployee: (departmentId: number | string, employeeId: number | string) => apiRequest(
    `/departments/${departmentId}/employees`, 
    { 
      method: 'POST', 
      body: JSON.stringify({ employeeId }) 
    }
  ),
  removeEmployee: (departmentId: number | string, employeeId: number | string) => apiRequest(
    `/departments/${departmentId}/employees/${employeeId}`, 
    { method: 'DELETE' }
  )
};

// Designation API functions
export const designationApi = {
  getAll: () => apiRequest('/designations'),
  getById: (id: number | string) => apiRequest(`/designations/${id}`),
  create: (data: any) => apiRequest('/designations', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number | string, data: any) => apiRequest(`/designations/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number | string) => apiRequest(`/designations/${id}`, { method: 'DELETE' }),
  getDesignationEmployees: (designationId: number | string) => apiRequest(`/designations/${designationId}/employees`),
  assignEmployee: (designationId: number | string, employeeId: number | string) => apiRequest(
    `/designations/${designationId}/employees`, 
    { 
      method: 'POST', 
      body: JSON.stringify({ employeeId }) 
    }
  ),
  removeEmployee: (designationId: number | string, employeeId: number | string) => apiRequest(
    `/designations/${designationId}/employees/${employeeId}`, 
    { method: 'DELETE' }
  )
};

export const emailApi = {
  sendCredentialsEmail: (email: string, name: string, password: string) => 
    apiRequest('/email/send-credentials', {
      method: 'POST',
      body: JSON.stringify({ email, name, password })
    }),
  sendUpdateCredentialsEmail: (email: string, name: string, password: string) => 
    apiRequest('/email/send-updated-credentials', {
      method: 'POST',
      body: JSON.stringify({ email, name, password })
    })
};
export default {
  companyApi,
  locationApi,
  shiftApi,
  employeeApi,
  projectApi,
  attendanceApi,
  authApi,
  noticeApi,
  leaveApi,
  departmentApi,
  designationApi,
  emailApi
};
