
// Warning: This file is getting quite large (over 500 lines). Consider refactoring into smaller components.
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PenLine, Trash2, Plus, Search, Eye, EyeOff, Mail, Key } from 'lucide-react';
import { departmentApi, employeeApi, projectApi,shiftApi,emailApi} from '@/services/api';
// import { sendEmail, sendCredentialsEmail} from '@/utils/email';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import SearchableSelect from '@/components/SearchableSelect';
import LocationPolygonSelector from '@/components/LocationPolygonSelector';
import LocationMap from '../components/LocationMap';


interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  project: string;
  location: string;
  allowMultipleDevices: boolean;
  role: string;
  locationCoordinates?: { lat: number; lng: number }[];
}

const Employees = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number }[]>([]);

  // Confirmation states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [showPasswordChangeConfirmation, setShowPasswordChangeConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<{id: number, name: string}[]>([]);
  const [departments,setDepartments] = useState<{id: number, name: string}[]>([]);
  const [locations, setLocations] = useState<{id: number, name: string}[]>([]);
  const [shiftsData,setShiftsData] = useState<any>(null);

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }[]>([]);


  const [projectOptions, setProjectOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);

  // Role options
  const roleOptions = [
    { value: 'user', label: 'user' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
  ];

  
  

  useEffect(() => {
    fetchData();
    
  }, []);


  // Effect to update options after data has been fetched
  useEffect(() => {
    if (projects.length) {
      setProjectOptions(
        projects.map(project => ({
          value: project.name,
          label: project.name
        }))
      );
    }

   if(departments.length){

      setDeptOptions(
        departments.map(department => ({
          value: department.name,
          label: department.name
        }))
      );
   }

      // setLocationOptions(
      //   locations.map(location => ({
      //     value: location.name,
      //     label: location.name
      //   }))
      // );

      if(shiftsData != null && shiftsData.length){
        setShiftOptions(
          shiftsData.map(shift => ({
            value: shift.name,
            label: shift.name
          }))
        );
      }

      
      //console.log("shiftsData",shiftsData,shiftOptions)
  }, [projects, departments,shiftsData]); // Re-run when any of these arrays change

  const fetchData = async () => {
    try {
      setLoading(true);
      
     // Fetch all required data
    const shiftsResponse = await shiftApi.getAll();
    const employeesResponse = await employeeApi.getAll();
    const projectsResponse = await projectApi.getAll();
    const departmentsResponse = await departmentApi.getAll();
    
    // Ensure we always have arrays
    const shiftsData = Array.isArray(shiftsResponse) ? shiftsResponse : [];
    const employeesData = Array.isArray(employeesResponse) 
      ? employeesResponse 
      : employeesResponse?.employees || [];
    const projectsData = Array.isArray(projectsResponse) ? projectsResponse : [];
    const departmentsData = Array.isArray(departmentsResponse) ? departmentsResponse : [];
    
    setEmployees(employeesData);
    setProjects(projectsData);
    setShiftsData(shiftsData);
    setDepartments(departmentsData);
    

      
      // setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('error'),
        description: t('errorFetchingData'),
        variant: 'destructive'
      });
      
      // Fallback data if API fails
      setEmployees([
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234', project: 'Project A', location: 'Main Office', allowMultipleDevices: false, role: 'normal' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678', project: 'Project B', location: 'Site B', allowMultipleDevices: true, role: 'admin' },
        { id: 3, name: 'Michael Brown', email: 'michael@example.com', phone: '555-9012', project: 'Project A', location: 'Main Office', allowMultipleDevices: false, role: 'super_admin' },
      ]);
      
      setProjects([
        { id: 1, name: 'Project A' },
        { id: 2, name: 'Project B' },
        { id: 3, name: 'Project C' },
      ]);
      
      setLocations([
        { id: 1, name: 'Main Office' },
        { id: 2, name: 'Site B' },
        { id: 3, name: 'Site C' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    return password;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleAddEmployeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Generate a password if none is provided
    const password = formData.get('password')?.toString() || generateRandomPassword();
    
    const newEmployee = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      project: formData.get('project')?.toString() || '',
      department :formData.get('department')?.toString() || '',
      // location: formData.get('location')?.toString() || '',
      role: formData.get('role')?.toString() || 'user',
      shift: formData.get('shift')?.toString() || "",
      password: password,
      // locationCoordinates: locationCoordinates.length > 0 ? locationCoordinates : undefined
      coordinates: coordinates
    };
    
    // Store pending form data and show confirmation
    setPendingFormData({ action: 'create', data: newEmployee });
    setShowCreateConfirmation(true);
  };

  const handleAddEmployee = async () => {
    if (!pendingFormData || pendingFormData.action !== 'create') return;
    
    try {
      const response = await employeeApi.create(pendingFormData.data);
      
      // Send email with credentials
      // await sendEmail(
      //   pendingFormData.data.email,
      //   'Welcome to ShiftTrack HR',
      //   `Hello ${pendingFormData.data.name},\n\nYour account has been created. Here are your login credentials:\n\nEmail: ${pendingFormData.data.email}\nPassword: ${pendingFormData.data.password}\n\nPlease login at our platform and change your password on first login.\n\nBest regards,\nThe Team`
      // );

      //sendCredentialsEmail(pendingFormData.data.email,pendingFormData.data.name,pendingFormData.data.password)

      emailApi.sendCredentialsEmail(pendingFormData.data.email,pendingFormData.data.name,pendingFormData.data.password)
      
      toast({
        title: t('success'),
        description: t('employeeCreatedAndEmailSent'),
      });
      
      fetchData(); // Refresh list
      setIsAddDialogOpen(false);
      setLocationCoordinates([]);
      setGeneratedPassword('');
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: t('error'),
        description: t('errorCreatingEmployee'),
        variant: 'destructive'
      });
    } finally {
      setPendingFormData(null);
    }
  };

  const handleUpdateEmployeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    const formData = new FormData(e.currentTarget);
    
    const updatedEmployee = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      project: formData.get('project')?.toString() || '',
      department:formData.get('department')?.toString() || '',
      coordinates: coordinates || selectedEmployee.coordinates,
      shift:formData.get('shift')?.toString() || '',
      role: formData.get('role')?.toString(),
    };

    // console.log("updatedEmployee",updatedEmployee)
    
    // Store pending form data and show confirmation
    setPendingFormData({ action: 'update', id: selectedEmployee.id, data: updatedEmployee });
    setShowUpdateConfirmation(true);
  };

  const handleUpdateEmployee = async () => {
    if (!pendingFormData || pendingFormData.action !== 'update') return;
    
    try {
      await employeeApi.update(pendingFormData.id, pendingFormData.data);
      toast({
        title: t('success'),
        description: t('employeeUpdated'),
      });
      fetchData(); // Refresh list
      setIsEditDialogOpen(false);
      setLocationCoordinates([]);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: t('error'),
        description: t('errorUpdatingEmployee'),
        variant: 'destructive'
      });
    } finally {
      setPendingFormData(null);
    }
  };

  const initiateDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      await employeeApi.delete(selectedEmployee.id);
      toast({
        title: t('success'),
        description: t('employeeDeleted'),
      });
      fetchData(); // Refresh list
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: t('error'),
        description: t('errorDeletingEmployee'),
        variant: 'destructive'
      });
    } finally {
      setSelectedEmployee(null);
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast({
        title: t('error'),
        description: t('passwordsDoNotMatch'),
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedEmployee) return;
    
    // Store pending password change and show confirmation
    setPendingFormData({ action: 'changePassword', id: selectedEmployee.id, data: { newpassword: pendingFormData.password ,oldpassword:selectedEmployee.password} });
    setShowPasswordChangeConfirmation(true);
  };

  const handleChangePassword = async () => {
    if (!pendingFormData || pendingFormData.action !== 'changePassword') return;
    
    try {
      await employeeApi.changePassword(pendingFormData.id, pendingFormData.data);
      toast({
        title: t('success'),
        description: t('passwordChanged'),
      });
      setIsChangePasswordDialogOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: t('error'),
        description: t('errorChangingPassword'),
        variant: 'destructive'
      });
    } finally {
      setPendingFormData(null);
    }
  };

  const handleMultipleDevicesToggle = async (employeeId: number, currentValue: boolean) => {
    try {
      const updated_status = currentValue == true ? false : true
      // console.log("currentValue",currentValue)
      await employeeApi.updateMultipleDeviceAccess(employeeId, { "allowMultipleDevices": updated_status });
      setEmployees(employees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, isMultipleDeviceAllowed: updated_status }
          : emp
      ));
      const employeesData = await employeeApi.getAll();
      setEmployees(employeesData);
      toast({
        title: t('success'),
        description: t('settingsUpdated'),
      });
    } catch (error) {
      console.error('Error updating multiple devices setting:', error);
      toast({
        title: t('error'),
        description: t('errorUpdatingSettings'),
        variant: 'destructive'
      });
    }
  };


  const handleEmployeeAccessToggle = async (employeeId: number, currentValue: boolean) => {
    try {
      const updated_status = currentValue == true ? false : true
      // console.log("currentValue",currentValue)
      await employeeApi.updateEmployeeAccess(employeeId, { "allowEmployee": updated_status });
      setEmployees(employees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, availability: updated_status }
          : emp
      ));
      const employeesData = await employeeApi.getAll();
      setEmployees(employeesData);
      toast({
        title: t('success'),
        description: t('settingsUpdated'),
      });
    } catch (error) {
      console.error('Error updating multiple devices setting:', error);
      toast({
        title: t('error'),
        description: t('errorUpdatingSettings'),
        variant: 'destructive'
      });
    }
  };


  const handlePolygonComplete = (coords: { lat: number; lng: number }[]) => {
    setCoordinates(coords);
    toast({
      title: 'Success',
      description: 'Location boundary has been marked successfully.',
    });
  };

  // // Convert projects and locations to options format for searchable select
  // const projectOptions = projects.map(project => ({
  //   value: project.name,
  //   label: project.name
  // }));

  // const deptOptions = departments.map(project => ({
  //   value: project.name,
  //   label: project.name
  // }));

  // //console.log("deptOptions",deptOptions)
  
  // const locationOptions = locations.map(location => ({
  //   value: location.name,
  //   label: location.name
  // }));

  // const shiftOptions = shiftsData.map(shift =>({
  //   value: shift.name,
  //   label:shift.name
  // }));

 const filteredEmployees = (Array.isArray(employees) ? employees : [])
  .filter(emp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.project?.toLowerCase().includes(query) ||
      emp.location?.toLowerCase().includes(query) ||
      emp.role?.toLowerCase().includes(query)
    );
  });

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setLocationCoordinates(employee.locationCoordinates || []);
    setIsEditDialogOpen(true);
  };

  const handleChangePasswordClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewPassword('');
    setConfirmNewPassword('');
    setIsChangePasswordDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">{t('employees')}</h1>
      
      <div className="flex justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`${t('search')}...`}
            className="pl-10 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  <DialogTrigger asChild>
    <Button className="gap-1">
      <Plus className="h-4 w-4" />
      {t('addEmployee')}
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader>
      <DialogTitle>{t('addEmployee')}</DialogTitle>
    </DialogHeader>
    <div className="overflow-y-auto flex-1 px-1">
      <form onSubmit={handleAddEmployeeSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <div className="flex items-center space-x-2">
              <Input id="email" name="email" type="email" required className="flex-grow" />
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
                className="flex-shrink-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => {
                  toast({
                    title: t('info'),
                    description: t('emailWillBeSentAutomatically'),
                  });
                }}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder={t('leaveBlankToGenerate')}
                value={generatedPassword}
                onChange={(e) => setGeneratedPassword(e.target.value)}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">{t('passwordGeneratedOnSubmit')}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input id="phone" name="phone" required />
          </div>

          {/* <div className="grid gap-2">
            <Label htmlFor="project">{t('department')}</Label>
          <SearchableSelect
            options={deptOptions ?? []}
            value=""
            onChange={(value) => {
              const deptInput = document.querySelector('input[name="department"]') as HTMLInputElement;
              if (deptInput) deptInput.value = value;
            }}
            placeholder={`${t('select')} ${t('department')}`}
            name="department"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">{t('project')}</Label>
            <SearchableSelect
              options={projectOptions}
              value=""
              onChange={(value) => {
                const projectInput = document.querySelector('input[name="project"]') as HTMLInputElement;
                if (projectInput) projectInput.value = value;
              }}
              placeholder={`${t('select')} ${t('project')}`}
              name="project"
              // required
            />
          </div> */}


<div className="grid gap-2">
  <Label htmlFor="department">{t('department')}</Label>
  <select
    id="department"
    name="department"
    className="border rounded p-2"
    // required
  >
    <option value="">{t('select')} {t('department')}</option>
    {deptOptions?.map((dept) => (
      <option key={dept.value} value={dept.value}>
        {dept.label}
      </option>
    ))}
  </select>
</div>

<div className="grid gap-2">
  <Label htmlFor="project">{t('project')}</Label>
  <select
    id="project"
    name="project"
    className="border rounded p-2"
    // required
  >
    <option value="">{t('select')} {t('project')}</option>
    {projectOptions?.map((project) => (
      <option key={project.value} value={project.value}>
        {project.label}
      </option>
    ))}
  </select>
</div>

<div className="grid gap-2">
  <Label htmlFor="shift">{t('shift')}</Label>
  <select
    id="shift"
    name="shift"
    className="border rounded p-2"
    // required
  >
    <option value="">{t('select')} {t('shift')}</option>
    {shiftOptions?.map((shift) => (
      <option key={shift.value} value={shift.value}>
        {shift.label}
      </option>
    ))}
  </select>
</div>


          <div className="grid gap-2">
            <Label htmlFor="role">{t('role')}</Label>
            <Select name="role" defaultValue="normal" required>
              <SelectTrigger>
                <SelectValue placeholder={`${t('select')} ${t('role')}`} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t('locationArea')}</Label>
            <div className="border rounded-lg overflow-hidden">
              <LocationMap onPolygonComplete={handlePolygonComplete} initialCoordinates={coordinates} />
            </div>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-background pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setIsAddDialogOpen(false);
              setGeneratedPassword('');
              setLocationCoordinates([]);
            }}
          >
            {t('cancel')}
          </Button>
          <Button type="submit">{t('save')}</Button>
        </DialogFooter>
      </form>
    </div>
  </DialogContent>
</Dialog>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('phone')}</TableHead>
              <TableHead>{t('project')}</TableHead>
              <TableHead>{t('department')}</TableHead>
              <TableHead>{t('location')}</TableHead>
              <TableHead>{t('shift')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('multipleDevices')}</TableHead>
              <TableHead>{t('EmployeeAccess')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee?.project_assigned}</TableCell>
                <TableCell>{employee?.department}</TableCell>
                <TableCell>{employee.location}</TableCell>
                <TableCell>{employee.shift}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.role === 'super_admin' 
                      ? ' text-purple-800' 
                      : employee.role === 'admin'
                        ? ' text-blue-800'
                        : 'text-gray-800'
                  }`}>
                    {employee.role === 'super_admin' 
                      ? 'Super Admin' 
                      : employee.role === 'admin' 
                        ? 'Admin' 
                        : 'user'}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={employee.isMultipleDeviceAllowed}
                    onCheckedChange={() => handleMultipleDevicesToggle(employee.id, employee.isMultipleDeviceAllowed)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={employee.availability}
                    onCheckedChange={() => handleEmployeeAccessToggle(employee.id, employee.availability)}
                  />
                </TableCell>
                <TableCell className="space-x-1">
                  <Dialog open={isEditDialogOpen && selectedEmployee?.id === employee.id} onOpenChange={(open) => {
                    if (!open) {
                      setIsEditDialogOpen(false);
                      setLocationCoordinates([]);
                    }
                  }}>
                    <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                  </Dialog>
                  
                  <Button variant="ghost" size="icon" onClick={() => initiateDeleteEmployee(employee)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  {/* <Button variant="ghost" size="icon" onClick={() => handleChangePasswordClick(employee)}>
                    <Key className="h-4 w-4" />
                  </Button> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Employee Dialog */}
{selectedEmployee && (
  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{t('updateEmployee')}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleUpdateEmployeeSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="edit-name">{t('name')}</Label>
            <Input 
              id="edit-name" 
              name="name" 
              defaultValue={selectedEmployee.name} 
              required 
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="edit-email">{t('email')}</Label>
            <Input 
              id="edit-email" 
              name="email" 
              type="email" 
              defaultValue={selectedEmployee.email} 
              required 
            />
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="edit-phone">{t('phone')}</Label>
            <Input 
              id="edit-phone" 
              name="phone" 
              defaultValue={selectedEmployee.phone} 
              required 
            />
          </div>

          {/* Department */}
          <div className="grid gap-2">
            <Label htmlFor="edit-department">{t('department')}</Label>
            <select
              id="edit-department"
              name="department"
              className="border rounded p-2"
              defaultValue={selectedEmployee?.department}
              // required
            >
              <option value="">{t('select')} {t('department')}</option>
              {deptOptions?.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="grid gap-2">
            <Label htmlFor="edit-project">{t('project')}</Label>
            <select
              id="edit-project"
              name="project"
              className="border rounded p-2"
              defaultValue={selectedEmployee?.project_assigned} 
              // required
            >
              <option value="">{t('select')} {t('project')}</option>
              {projectOptions?.map((project) => (
                <option key={project.value} value={project.value}>
                  {project.label}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <Label htmlFor="edit-role">{t('role')}</Label>
            <Select name="role" defaultValue={selectedEmployee.role} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-shift">{t('shift')}</Label>
            <select
              id="edit-shift"
              name="shift"
              className="border rounded p-2"
              defaultValue={selectedEmployee?.shift}
              // required
            >
              <option value="">{t('select')} {t('shift')}</option>
              {shiftOptions?.map((shift) => (
                <option key={shift.value} value={shift.value}>
                  {shift.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Area (Map) */}
          <div className="grid gap-2 md:col-span-2">
            <Label>{t('locationArea')}</Label>
            <div className="border rounded-lg overflow-hidden h-64">
              <LocationMap onPolygonComplete={handlePolygonComplete} initialCoordinates={selectedEmployee.coordinates} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button type="submit">{t('save')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)}


      {/* Change Password Dialog */}
      {selectedEmployee && (
        <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('changePassword')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-password">{t('newPassword')}</Label>
                  <div className="relative">
                    <Input 
                      id="new-password" 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required 
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showPassword ? "text" : "password"} 
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required 
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit">{t('save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showCreateConfirmation}
        onClose={() => setShowCreateConfirmation(false)}
        onConfirm={handleAddEmployee}
        title={t('confirmCreate')}
        description={t('createEmployeeConfirmation')}
        confirmText={t('create')}
        cancelText={t('cancel')}
      />

      <ConfirmationDialog
        isOpen={showUpdateConfirmation}
        onClose={() => setShowUpdateConfirmation(false)}
        onConfirm={handleUpdateEmployee}
        title={t('confirmUpdate')}
        description={t('updateEmployeeConfirmation')}
        confirmText={t('update')}
        cancelText={t('cancel')}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteEmployee}
        title={t('confirmDelete')}
        description={`${t('deleteEmployeeConfirmation')} ${selectedEmployee?.name}?`}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="destructive"
      />

      <ConfirmationDialog
        isOpen={showPasswordChangeConfirmation}
        onClose={() => setShowPasswordChangeConfirmation(false)}
        onConfirm={handleChangePassword}
        title={t('confirmPasswordChange')}
        description={t('passwordChangeConfirmation')}
        confirmText={t('change')}
        cancelText={t('cancel')}
      />
    </div>
  );
};

export default Employees;
