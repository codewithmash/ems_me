// Basic response types
export interface BaseResponse {
  message?: string;
  success?: boolean;
}

export interface ErrorResponse extends BaseResponse {
  error?: string;
  code?: number;
}

// Authentication types
export interface AuthResponse extends BaseResponse {
  token?: string;
  refreshToken?: string;
  employee?: Employee;
}

// Employee status types
export type EmploymentStatus = 'active' | 'on-leave' | 'terminated' | 'probation';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';

// Location coordinate types
export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: Date;
}

// Detailed employee types
export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  position?: string;
  department?: string;
  departmentId?: number;
  managerId?: number;
  hireDate?: Date;
  terminationDate?: Date | null;
  salary?: number;
  employmentStatus?: EmploymentStatus;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  bio?: string;
  skills?: string[];
  qualifications?: string[];
  profilePicture?: string;
  faceData?: string; // Base64 or reference to facial recognition data
  faceDataStatus?: 'pending' | 'approved' | 'rejected';
  isMultipleDeviceAllowed?: boolean;
  availability?: boolean;
  shiftId?: number;
  shift?: Shift;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extended employee types
export interface EmployeeWithRelations extends Employee {
  company?: Company;
  projects?: ProjectEmployee[];
  attendance?: Attendance[];
  documents?: EmployeeDocument[];
  leaveRequests?: LeaveRequest[];
}

// Employee document types
export interface EmployeeDocument {
  id: number;
  employeeId: number;
  documentType: string;
  title: string;
  fileUrl: string;
  issueDate?: Date;
  expiryDate?: Date | null;
  notes?: string;
  createdAt?: Date;
}

// Employee time tracking types
export interface TimeTracking {
  id: number;
  employeeId: number;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  totalHours?: number;
  breakStart?: Date;
  breakEnd?: Date;
  breakDuration?: number;
  location?: Coordinates;
  ipAddress?: string;
  deviceInfo?: string;
  status?: AttendanceStatus;
  notes?: string;
}

// Leave request types
export interface LeaveRequest {
  id: number;
  employeeId: number;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedById?: number;
  comments?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Company types (extended)
export interface Company {
  id: number;
  name: string;
  legalName?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  foundedYear?: number;
  logo?: string;
  timezone?: string;
  createdAt?: Date;
}

// Location types (extended)
export interface Location {
  id: number;
  companyId?: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive?: boolean;
  timezone?: string;
  createdAt?: Date;
}

// Shift types (extended)
export interface Shift {
  id: number;
  companyId?: number;
  name: string;
  startTime: string; // "HH:MM" format
  endTime: string;   // "HH:MM" format
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
}

// Project types (extended)
export interface Project {
  id: number;
  companyId?: number;
  name: string;
  description?: string;
  clientName?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  createdAt?: Date;
}

export interface ProjectEmployee {
  id?: number;
  projectId: number;
  employeeId: number;
  designation: string;
  startDate?: Date;
  endDate?: Date | null;
  isActive?: boolean;
  hourlyRate?: number;
  createdAt?: Date;
}

// Attendance types (extended)
export interface Attendance {
  id: number;
  employeeId: number;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  locationId?: number;
  location?: Location;
  shiftId?: number;
  shift?: Shift;
  totalHours?: number;
  overtimeHours?: number;
  earlyLeaveMinutes?: number;
  lateMinutes?: number;
  notes?: string;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt?: Date;
}

// Response types
export type EmployeeResponse = BaseResponse & { employee: Employee };
export type EmployeeListResponse = BaseResponse & { employees: Employee[] };
export type EmployeeWithRelationsResponse = BaseResponse & { employee: EmployeeWithRelations };

export type CompanyResponse = BaseResponse & { company: Company };
export type CompanyListResponse = BaseResponse & { companies: Company[] };

export type LocationResponse = BaseResponse & { location: Location };
export type LocationListResponse = BaseResponse & { locations: Location[] };

export type ShiftResponse = BaseResponse & { shift: Shift };
export type ShiftListResponse = BaseResponse & { shifts: Shift[] };

export type ProjectResponse = BaseResponse & { project: Project };
export type ProjectListResponse = BaseResponse & { projects: Project[] };
export type ProjectEmployeeListResponse = BaseResponse & { employees: (Employee & { designation: string })[] };

export type AttendanceResponse = BaseResponse & { attendance: Attendance };
export type AttendanceListResponse = BaseResponse & { attendances: Attendance[] };
export type AttendanceByDateResponse = BaseResponse & { records: (Attendance & { employee: Employee })[] };

export type LeaveRequestResponse = BaseResponse & { leaveRequest: LeaveRequest };
export type LeaveRequestListResponse = BaseResponse & { leaveRequests: LeaveRequest[] };

export type DocumentResponse = BaseResponse & { document: EmployeeDocument };
export type DocumentListResponse = BaseResponse & { documents: EmployeeDocument[] };