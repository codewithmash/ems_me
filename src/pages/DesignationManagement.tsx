
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designationApi, employeeApi } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Trash2, Edit, Award, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendDesignationAssignmentEmail } from '@/utils/email';

const DesignationManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedDesignationId, setSelectedDesignationId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Fetch designations and employees
  const { data: designations = [], isLoading: isLoadingDesignations } = useQuery({
    queryKey: ['designations'],
    queryFn: designationApi.getAll,
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  // Create designation mutation
  const createDesignationMutation = useMutation({
    mutationFn: (designationData: any) => designationApi.create(designationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Designation has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create designation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update designation mutation
  const updateDesignationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => designationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Designation has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update designation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete designation mutation
  const deleteDesignationMutation = useMutation({
    mutationFn: (id: number) => designationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast({
        title: 'Success',
        description: 'Designation has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete designation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Assign employee to designation mutation
  const assignEmployeeMutation = useMutation({
    mutationFn: ({ designationId, employeeId }: { designationId: number, employeeId: string }) => 
      designationApi.assignEmployee(designationId, employeeId),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      
      // Find the designation and employee for email notification
      const designation = designations.find((d: any) => d.id === variables.designationId);
      const employee = employees.find((e: any) => e.id === variables.employeeId || e.employeeId === variables.employeeId);
      
      if (designation && employee) {
        // Send email notification
        await sendDesignationAssignmentEmail(
          employee.email,
          employee.name,
          designation.title
        );
      }
      
      setShowAssignDialog(false);
      setSelectedDesignationId(null);
      setSelectedEmployeeId('');
      
      toast({
        title: 'Success',
        description: 'Employee has been assigned to the designation successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to assign employee: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: 'Warning',
        description: 'Please enter a designation title.',
        variant: 'destructive',
      });
      return;
    }

    const designationData = {
      title,
      description,
      department,
      responsibilities,
      createdAt: new Date().toISOString(),
    };

    if (isEditing && editingId) {
      updateDesignationMutation.mutate({ id: editingId, data: designationData });
    } else {
      createDesignationMutation.mutate(designationData);
    }
  };

  const handleEdit = (designation: any) => {
    setTitle(designation.title);
    setDescription(designation.description || '');
    setDepartment(designation.department || '');
    setResponsibilities(designation.responsibilities || '');
    setEditingId(designation.id);
    setIsEditing(true);
  };

  const handleOpenAssignDialog = (designationId: number) => {
    setSelectedDesignationId(designationId);
    setShowAssignDialog(true);
  };

  const handleAssignEmployee = () => {
    if (selectedDesignationId && selectedEmployeeId) {
      assignEmployeeMutation.mutate({
        designationId: selectedDesignationId,
        employeeId: selectedEmployeeId,
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDepartment('');
    setResponsibilities('');
    setEditingId(null);
    setIsEditing(false);
  };

  // Get employees assigned to a designation
  const getAssignedEmployees = (designationId: number) => {
    return employees.filter((employee: any) => {
      return employee.designationId === designationId;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Designation Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Update Designation' : 'Create Designation'}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Designation Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter designation title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Designation description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Department (optional)"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Key responsibilities for this designation"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetForm} type="button">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createDesignationMutation.isPending || updateDesignationMutation.isPending}
                >
                  {(createDesignationMutation.isPending || updateDesignationMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? 'Update Designation' : 'Create Designation'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Designations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDesignations ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : designations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium text-gray-500">No designations found</h3>
                  <p className="text-gray-400">Create a designation to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {designations.map((designation: any) => {
                        const assignedEmployees = getAssignedEmployees(designation.id);
                        
                        return (
                          <TableRow key={designation.id}>
                            <TableCell className="font-medium">{designation.title}</TableCell>
                            <TableCell>{designation.department || 'N/A'}</TableCell>
                            <TableCell>{assignedEmployees.length}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleOpenAssignDialog(designation.id)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(designation)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteDesignationMutation.mutate(designation.id)}
                                  disabled={deleteDesignationMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Assign Employee Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Employee to Designation</DialogTitle>
            <DialogDescription>
              Select an employee to assign to this designation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="employeeSelect">Select Employee</Label>
            <Select 
              value={selectedEmployeeId} 
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee: any) => (
                  <SelectItem 
                    key={employee.id || employee.employeeId} 
                    value={employee.id || employee.employeeId}
                  >
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignEmployee} 
              disabled={!selectedEmployeeId || assignEmployeeMutation.isPending}
            >
              {assignEmployeeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignationManagement;
