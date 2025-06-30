import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Textarea } from '@/components/ui/textarea';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { PenLine, Trash2, Plus, Search, Users, Calendar } from 'lucide-react';
import { projectApi, employeeApi } from '@/services/api';
import { sendCredentialsEmail } from '@/utils/email';

interface Project {
  id: number;
  name: string;
  description: string;
  locationId: number;
  locationName: string;
  startDate: string;
  endDate: string | null;
  status: string;
}

interface Location {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface ProjectEmployee {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
}

const PROJECT_STATUS_OPTIONS = [
  'Not Started',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled'
];

const ProjectManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewEmployeesDialogOpen, setIsViewEmployeesDialogOpen] = useState(false);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isAddEmployeeConfirmOpen, setIsAddEmployeeConfirmOpen] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectEmployees, setProjectEmployees] = useState<ProjectEmployee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Project>>({});

  useEffect(() => {
    loadProjects();
    loadAllEmployees();
  }, []);

  useEffect(() => {
    if (selectedProject && projectEmployees.length) {
      const projectEmployeeIds = projectEmployees.map(employee => employee.id);
      const filteredEmployees = allEmployees.filter(
        employee => !projectEmployeeIds.includes(employee.id)
      );
      setAvailableEmployees(filteredEmployees);
    } else {
      setAvailableEmployees(allEmployees);
    }
  }, [selectedProject, projectEmployees, allEmployees]);

  const loadProjects = async () => {
    try {
      const projectsData = await projectApi.getAll();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    }
  };

  const loadAllEmployees = async () => {
    try {
      const employeesData = await employeeApi.getAll();
      setAllEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    }
  };

  const loadProjectEmployees = async (projectId: number) => {
    try {
      const employees = await projectApi.getProjectEmployees(projectId);
      setProjectEmployees(employees);
    } catch (error) {
      console.error('Error loading project employees:', error);
      toast({
        title: "Error",
        description: "Failed to load project employees",
        variant: "destructive"
      });
    }
  };

  const handleAddProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProject = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      locationId: parseInt(formData.get('locationId') as string),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || null,
      status: formData.get('status') as string,
    };
    
    setFormData(newProject);
    setIsCreateConfirmOpen(true);
  };

  const confirmAddProject = async () => {
    try {
      await projectApi.create(formData);
      toast({
        title: "Success",
        description: "Project created successfully"
      });
      loadProjects();
      setIsAddDialogOpen(false);
      setIsCreateConfirmOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    const formData = new FormData(e.currentTarget);
    
    const updatedProject = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      locationId: parseInt(formData.get('locationId') as string),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || null,
      status: formData.get('status') as string,
    };
    
    setFormData(updatedProject);
    setIsUpdateConfirmOpen(true);
  };

  const confirmUpdateProject = async () => {
    if (!selectedProject) return;
    
    try {
      await projectApi.update(selectedProject.id, formData);
      toast({
        title: "Success",
        description: "Project updated successfully"
      });
      loadProjects();
      setIsEditDialogOpen(false);
      setIsUpdateConfirmOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      await projectApi.delete(selectedProject.id);
      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
      loadProjects();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
  };

  const handleViewEmployees = async (project: Project) => {
    setSelectedProject(project);
    await loadProjectEmployees(project.id);
    setIsViewEmployeesDialogOpen(true);
  };

  const handleAddEmployeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddEmployeeConfirmOpen(true);
  };

  const confirmAddEmployee = async () => {
    if (!selectedProject || !selectedEmployeeId) return;
    
    try {
      //console.log("selectedProject.name",selectedProject.name)
      const data = {"employeeId":selectedEmployeeId,"projectname":selectedProject.name}
      await projectApi.assignEmployee(selectedProject.id, data);
      
      const employee = allEmployees.find(emp => emp.id.toString() === selectedEmployeeId);
      
      // if (employee) {
      //   try {
      //     await sendCredentialsEmail(
      //       employee.email, 
      //       employee.name, 
      //       `EMP${employee.id}`, 
      //       "You've been assigned to a new project"
      //     );
          
      //     toast({
      //       title: "Success",
      //       description: "Employee assigned to project and notification sent"
      //     });
      //   } catch (error) {
      //     console.error('Error sending email:', error);
      //     toast({
      //       title: "Warning",
      //       description: "Employee assigned but failed to send notification",
      //       variant: "destructive"
      //     });
      //   }
      // }
      
      setIsAddEmployeeDialogOpen(false);
      setIsAddEmployeeConfirmOpen(false);
      setSelectedEmployeeId('');
      setDesignation('');
      
      if (selectedProject) {
        loadProjectEmployees(selectedProject.id);
      }
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast({
        title: "Error",
        description: "Failed to assign employee to project",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = searchQuery
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">{t('projects')}</h1>
      
      <div className="flex justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`${t('search')} ${t('projects')}...`}
            className="pl-10 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              {t('createProject')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('createProject')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProjectSubmit} className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('name')}</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    rows={3} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">{t('startDate')}</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">{t('endDate')}</Label>
                    <Input id="endDate" name="endDate" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">{t('status')}</Label>
                  <Select name="status" required>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder={`${t('select')} ${t('status')}`} />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-full bg-white">
                      {PROJECT_STATUS_OPTIONS.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit">{t('save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Create Project Confirmation Dialog */}
      <Dialog open={isCreateConfirmOpen} onOpenChange={setIsCreateConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmProjectCreation')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('areYouSureCreateProject')}</p>
            <div className="mt-4 space-y-2">
              <p><span className="font-medium">{t('name')}:</span> {formData.name}</p>
              <p><span className="font-medium">{t('status')}:</span> {formData.status}</p>
              <p><span className="font-medium">{t('startDate')}:</span> {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : ''}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateConfirmOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={confirmAddProject}>{t('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Project Confirmation Dialog */}
      <Dialog open={isUpdateConfirmOpen} onOpenChange={setIsUpdateConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmProjectUpdate')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('areYouSureUpdateProject')}</p>
            <div className="mt-4 space-y-2">
              <p><span className="font-medium">{t('name')}:</span> {formData.name}</p>
              <p><span className="font-medium">{t('status')}:</span> {formData.status}</p>
              <p><span className="font-medium">{t('startDate')}:</span> {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : ''}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateConfirmOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={confirmUpdateProject}>{t('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Confirmation Dialog */}
      <Dialog open={isAddEmployeeConfirmOpen} onOpenChange={setIsAddEmployeeConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmEmployeeAssignment')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('areYouSureAddEmployee')}</p>
            {selectedEmployeeId && (
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">{t('employee')}:</span> {
                    allEmployees.find(e => e.id.toString() === selectedEmployeeId)?.name
                  }
                </p>
                {/* <p>
                  <span className="font-medium">{t('designation')}:</span> {designation}
                </p> */}
                <p>
                  <span className="font-medium">{t('project')}:</span> {selectedProject?.name}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeConfirmOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={confirmAddEmployee}>{t('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <CardDescription>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-col gap-3">
                {/* <div>
                  <span className="text-sm text-muted-foreground">{t('location')}:</span>
                  <span className="ml-2 font-medium">{project.locationName}</span>
                </div> */}
                <div>
                  <span className="text-sm text-muted-foreground">{t('status')}:</span>
                  <span className={`ml-2 text-sm px-2.5 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => handleViewEmployees(project)}
              >
                <Users className="h-4 w-4" />
                {t('viewEmployees')}
              </Button>
              <div className="flex gap-1">
                <Dialog 
                  open={isEditDialogOpen && selectedProject?.id === project.id} 
                  onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (open) setSelectedProject(project);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <PenLine className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('updateProject')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProjectSubmit} className="space-y-4 py-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-name">{t('name')}</Label>
                          <Input 
                            id="edit-name" 
                            name="name" 
                            defaultValue={selectedProject?.name} 
                            required 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-description">{t('description')}</Label>
                          <Textarea 
                            id="edit-description" 
                            name="description" 
                            rows={3}
                            defaultValue={selectedProject?.description} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-startDate">{t('startDate')}</Label>
                            <Input 
                              id="edit-startDate" 
                              name="startDate" 
                              type="date" 
                              defaultValue={selectedProject?.startDate?.substring(0, 10)} 
                              required 
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-endDate">{t('endDate')}</Label>
                            <Input 
                              id="edit-endDate" 
                              name="endDate" 
                              type="date" 
                              defaultValue={selectedProject?.endDate?.substring(0, 10)} 
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-status">{t('status')}</Label>
                          <Select name="status" defaultValue={selectedProject?.status} required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROJECT_STATUS_OPTIONS.map(status => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          {t('cancel')}
                        </Button>
                        <Button type="submit">{t('save')}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog 
                  open={isDeleteDialogOpen && selectedProject?.id === project.id} 
                  onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (open) setSelectedProject(project);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('deleteProject')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p>
                        {t('areYouSureDelete')} "{project.name}"? {t('thisActionCannot be')}
                      </p>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        {t('cancel')}
                      </Button>
                      <Button type="button" variant="destructive" onClick={handleDeleteProject}>
                        {t('delete')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog 
        open={isViewEmployeesDialogOpen} 
        onOpenChange={setIsViewEmployeesDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProject?.name} - {t('employees')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{t('assignedEmployees')}</h3>
            
            <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('addEmployee')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('addEmployeeToProject')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEmployeeSubmit} className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employeeId">{t('employee')}</Label>
                      <Select 
                        value={selectedEmployeeId} 
                        onValueChange={setSelectedEmployeeId}
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`${t('select')} ${t('employee')}`} />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-full bg-white">
                          {availableEmployees.length > 0 ? (
                            availableEmployees.map(employee => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name} ({employee.email})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-employees" disabled>
                              {t('noAvailableEmployees')}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* <div className="grid gap-2">
                      <Label htmlFor="designation">{t('designation')}</Label>
                      <Input 
                        id="designation" 
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        required 
                      />
                    </div> */}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddEmployeeDialogOpen(false)}>
                      {t('cancel')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!selectedEmployeeId || availableEmployees.length === 0}
                    >
                      {t('save')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('phone')}</TableHead>
                {/* <TableHead>{t('designation')}</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectEmployees.length > 0 ? (
                projectEmployees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    {/* <TableCell>{employee.designation}</TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    {t('noEmployeesAssigned')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagement;