// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { departmentApi, locationApi, employeeApi } from '@/services/api';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Loader2, Trash2, Edit, Users, UserPlus, MapPin } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { sendDepartmentAssignmentEmail } from '@/utils/email';
// import LocationMap from '../components/LocationMap';
// import { useLanguage } from '@/contexts/LanguageContext';

// const DepartmentManagement = () => {
//   const {t} = useLanguage()
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
  
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [locationId, setLocationId] = useState('');
//   const [requiredStaffing, setRequiredStaffing] = useState('');
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showAssignDialog, setShowAssignDialog] = useState(false);
//   const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
//   const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }[]>([]);

  

//   // Confirmation dialog states
//   const [showCreateConfirm, setShowCreateConfirm] = useState(false);
//   const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [showAssignConfirm, setShowAssignConfirm] = useState(false);
//   const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);
//   const [formData, setFormData] = useState<any>({});

//   const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
//     queryKey: ['departments'],
//     queryFn: departmentApi.getAll,
//   });

//   const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
//     queryKey: ['locations'],
//     queryFn: locationApi.getAll,
//   });

//   const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
//     queryKey: ['employees'],
//     queryFn: employeeApi.getAll,
//   });

//   const createDepartmentMutation = useMutation({
//     mutationFn: (departmentData: any) => departmentApi.create(departmentData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['departments'] });
//       resetForm();
//       toast({
//         title: 'Success',
//         description: 'Department has been created successfully.',
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: 'Error',
//         description: `Failed to create department: ${error.message}`,
//         variant: 'destructive',
//       });
//     },
//   });

//   const updateDepartmentMutation = useMutation({
//     mutationFn: ({ id, data }: { id: number, data: any }) => departmentApi.update(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['departments'] });
//       resetForm();
//       toast({
//         title: 'Success',
//         description: 'Department has been updated successfully.',
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: 'Error',
//         description: `Failed to update department: ${error.message}`,
//         variant: 'destructive',
//       });
//     },
//   });

//   const deleteDepartmentMutation = useMutation({
//     mutationFn: (id: number) => departmentApi.delete(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['departments'] });
//       toast({
//         title: 'Success',
//         description: 'Department has been deleted successfully.',
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: 'Error',
//         description: `Failed to delete department: ${error.message}`,
//         variant: 'destructive',
//       });
//     },
//   });

//   const assignEmployeeMutation = useMutation({
//     mutationFn: ({ departmentId, employeeId }: { departmentId: number, employeeId: string }) => 
//       departmentApi.assignEmployee(departmentId, employeeId),
//     onSuccess: async (data, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['departments'] });
      
//       const department = departments.find((d: any) => d.id === variables.departmentId);
//       const employee = employees.find((e: any) => e.id === variables.employeeId || e.employeeId === variables.employeeId);
      
//       if (department && employee) {
//         await sendDepartmentAssignmentEmail(
//           employee.email,
//           employee.name,
//           department.name
//         );
//       }
      
//       setShowAssignDialog(false);
//       setSelectedDepartmentId(null);
//       setSelectedEmployeeId('');
      
//       toast({
//         title: 'Success',
//         description: 'Employee has been assigned to the department successfully.',
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: 'Error',
//         description: `Failed to assign employee: ${error.message}`,
//         variant: 'destructive',
//       });
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!name || !description) {
//       toast({
//         title: 'Warning',
//         description: 'Please fill in all required fields.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     const departmentData = {
//       name,
//       description,
//       coordinates,
//     };

//     setFormData(departmentData);

//     if (isEditing && editingId) {
//       setShowUpdateConfirm(true);
//     } else {
//       setShowCreateConfirm(true);
//     }
//   };

//   const confirmCreateDepartment = () => {
//     createDepartmentMutation.mutate(formData);
//     setShowCreateConfirm(false);
//   };

//   const confirmUpdateDepartment = () => {
//     if (editingId) {
//       updateDepartmentMutation.mutate({ id: editingId, data: formData });
//       setShowUpdateConfirm(false);
//     }
//   };

//   const handleDeleteClick = (departmentId: number) => {
//     setDepartmentToDelete(departmentId);
//     setShowDeleteConfirm(true);
//   };

//   const confirmDeleteDepartment = () => {
//     if (departmentToDelete) {
//       deleteDepartmentMutation.mutate(departmentToDelete);
//       setShowDeleteConfirm(false);
//       setDepartmentToDelete(null);
//     }
//   };

//   const handleEdit = (department: any) => {
//     setName(department.name);
//     setDescription(department.description);
//     setCoordinates(department.coordinates || []);
//     setEditingId(department.id);
//     setIsEditing(true);
//   };

//   const handleOpenAssignDialog = (departmentId: number) => {
//     setSelectedDepartmentId(departmentId);
//     setShowAssignDialog(true);
//   };

//   const handleAssignEmployee = () => {
//     if (selectedDepartmentId && selectedEmployeeId) {
//       setShowAssignConfirm(true);
//     }
//   };

//   const confirmAssignEmployee = () => {
//     if (selectedDepartmentId && selectedEmployeeId) {
//       assignEmployeeMutation.mutate({
//         departmentId: selectedDepartmentId,
//         employeeId: selectedEmployeeId,
//       });
//       setShowAssignConfirm(false);
//     }
//   };

//   const handlePolygonComplete = (coords: { lat: number; lng: number }[]) => {
//     setCoordinates(coords);
//     toast({
//       title: 'Success',
//       description: 'Location boundary has been marked successfully.',
//     });
//   };

//   const resetForm = () => {
//     setName('');
//     setDescription('');
//     setLocationId('');
//     setRequiredStaffing('');
//     setCoordinates([]);
//     setEditingId(null);
//     setIsEditing(false);
//   };

//   const getDepartmentName = (id: number) => {
//     return departments.find((d: any) => d.id === id)?.name || '';
//   };

//   const getEmployeeName = (id: string) => {
//     return employees.find((e: any) => e.id === id || e.employeeId === id)?.name || '';
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">{t('departmentManagement')}</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div>
//           <Card>
//             <CardHeader>
//               <CardTitle>{isEditing ? t('updateDepartment') : t('createDepartment')}</CardTitle>
//             </CardHeader>
//             <form onSubmit={handleSubmit}>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name">{t('departmentName')}</Label>
//                   <Input
//                     id="name"
//                     placeholder={t('enterDepartmentName')}
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description">{t('description')}</Label>
//                   <Textarea
//                     id="description"
//                     placeholder={t('enterDepartmentDescription')}
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     rows={3}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>{t('departmentBoundary')}</Label>
//                   <div className="border rounded-lg overflow-hidden">
//                     <LocationMap onPolygonComplete={handlePolygonComplete} initialCoordinates={coordinates} />
//                   </div>
//                 </div>
//               </CardContent>

//               <CardFooter className="flex justify-between">
//                 <Button variant="outline" onClick={resetForm} type="button">
//                   {t('cancel')}
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}
//                 >
//                   {(createDepartmentMutation.isPending || updateDepartmentMutation.isPending) && (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   )}
//                   {isEditing ? t('updateDepartment') : t('createDepartment')}
//                 </Button>
//               </CardFooter>
//             </form>
//           </Card>
//         </div>

//         <div>
//           <Card>
//             <CardHeader>
//               <CardTitle>{t('departments')}</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {isLoadingDepartments ? (
//                 <div className="flex justify-center py-8">
//                   <Loader2 className="h-8 w-8 animate-spin" />
//                 </div>
//               ) : departments.length === 0 ? (
//                 <div className="text-center py-8 bg-gray-50 rounded-md">
//                   <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
//                   <h3 className="text-lg font-medium text-gray-500">{t('noDepartmentsFound')}</h3>
//                   <p className="text-gray-400">{t('createDepartmentToStart')}</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>{t('name')}</TableHead>
//                         <TableHead>{t('description')}</TableHead>
//                         <TableHead>{t('location')}</TableHead>
//                         <TableHead className="text-right">{t('actions')}</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {departments.map((department: any) => (
//                         <TableRow key={department.id}>
//                           <TableCell className="font-medium">{department.name}</TableCell>
//                           <TableCell className="font-medium">{department.description}</TableCell>
//                           <TableCell>
//                             <div className="flex items-center">
//                               <MapPin className="h-3 w-3 mr-1 text-gray-400" />
//                               {department.location}
//                             </div>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <div className="flex justify-end space-x-2">
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => handleOpenAssignDialog(department.id)}
//                               >
//                                 <UserPlus className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => handleEdit(department)}
//                               >
//                                 <Edit className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => handleDeleteClick(department.id)}
//                                 disabled={deleteDepartmentMutation.isPending}
//                               >
//                                 <Trash2 className="h-4 w-4 text-red-500" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Assign Employee Dialog */}
//       <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{t('assignEmployee')}</DialogTitle>
//             <DialogDescription>
//               {t('assignEmployeeToDepartment')}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>{t('department')}</Label>
//               <Input 
//                 value={selectedDepartmentId ? getDepartmentName(selectedDepartmentId) : ''} 
//                 disabled 
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="employee">{t('employee')}</Label>
//               <Select 
//                 value={selectedEmployeeId} 
//                 onValueChange={setSelectedEmployeeId}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder={t('selectEmployee')} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {employees.map((employee: any) => (
//                     <SelectItem 
//                       key={employee.id || employee.employeeId} 
//                       value={employee.id || employee.employeeId}
//                     >
//                       {employee.name} ({employee.email})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
//               {t('cancel')}
//             </Button>
//             <Button 
//               onClick={handleAssignEmployee}
//               disabled={!selectedEmployeeId || assignEmployeeMutation.isPending}
//             >
//               {assignEmployeeMutation.isPending && (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               )}
//               {t('assign')}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Create Department Confirmation Dialog */}
//       <Dialog open={showCreateConfirm} onOpenChange={setShowCreateConfirm}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{t('confirmDepartmentCreation')}</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <p>{t('areYouSureCreateDepartment')}</p>
//             <div className="mt-4 space-y-2">
//               <p><span className="font-medium">{t('name')}:</span> {formData.name}</p>
//               <p><span className="font-medium">{t('description')}:</span> {formData.description}</p>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowCreateConfirm(false)}>
//               {t('cancel')}
//             </Button>
//             <Button onClick={confirmCreateDepartment}>
//               {t('confirm')}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Update Department Confirmation Dialog */}
//       <Dialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{t('confirmDepartmentUpdate')}</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <p>{t('areYouSureUpdateDepartment')}</p>
//             <div className="mt-4 space-y-2">
//               <p><span className="font-medium">{t('name')}:</span> {formData.name}</p>
//               <p><span className="font-medium">{t('description')}:</span> {formData.description}</p>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowUpdateConfirm(false)}>
//               {t('cancel')}
//             </Button>
//             <Button onClick={confirmUpdateDepartment}>
//               {t('confirm')}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Department Confirmation Dialog */}
//       <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{t('confirmDepartmentDeletion')}</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <p>{t('areYouSureDeleteDepartment')}</p>
//             {departmentToDelete && (
//               <p className="mt-2 font-medium">
//                 {t('department')}: {getDepartmentName(departmentToDelete)}
//               </p>
//             )}
//             <p className="mt-2 text-red-500">{t('thisActionCannotBeUndone')}</p>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
//               {t('cancel')}
//             </Button>
//             <Button 
//               variant="destructive" 
//               onClick={confirmDeleteDepartment}
//               disabled={deleteDepartmentMutation.isPending}
//             >
//               {deleteDepartmentMutation.isPending && (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               )}
//               {t('delete')}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Assign Employee Confirmation Dialog */}
//       <Dialog open={showAssignConfirm} onOpenChange={setShowAssignConfirm}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{t('confirmEmployeeAssignment')}</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <p>{t('areYouSureAssignEmployee')}</p>
//             {selectedDepartmentId && selectedEmployeeId && (
//               <div className="mt-4 space-y-2">
//                 <p><span className="font-medium">{t('department')}:</span> {getDepartmentName(selectedDepartmentId)}</p>
//                 <p><span className="font-medium">{t('employee')}:</span> {getEmployeeName(selectedEmployeeId)}</p>
//               </div>
//             )}
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowAssignConfirm(false)}>
//               {t('cancel')}
//             </Button>
//             <Button onClick={confirmAssignEmployee}>
//               {t('confirm')}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default DepartmentManagement;



import React, { useState,useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi, locationApi, employeeApi } from '@/services/api';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { Loader2, Trash2, Edit, Users, UserPlus, MapPin, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendDepartmentAssignmentEmail } from '@/utils/email';
import LocationMap from '../components/LocationMap';
import { useLanguage } from '@/contexts/LanguageContext';

const DepartmentManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationId, setLocationId] = useState('');
  const [requiredStaffing, setRequiredStaffing] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }[]>([]);
  const [showViewEmployeesDialog, setShowViewEmployeesDialog] = useState(false);
  const [departmentEmployees, setDepartmentEmployees] = useState<any[]>([]);
  const [viewingDepartmentId, setViewingDepartmentId] = useState<number | null>(null);
  const [newEmployeeToAssign, setNewEmployeeToAssign] = useState('');
  const [showAddExistingEmployeeDialog, setShowAddExistingEmployeeDialog] = useState(false);
  const [userToAssign, setUserToAssign] = useState('');

  // Confirmation dialog states
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);

  const [isLoadingEmployees,setIsLoadingEmployees] = useState(true)

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.getAll,
  });

  // const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
  //   queryKey: ['locations'],
  //   queryFn: locationApi.getAll,
  // });

  const { data: allEmployees = [], isLoading: isLoadingAllEmployees } = useQuery({
    queryKey: ['allEmployees'],
    queryFn: async () => {
      try {
        const response = await employeeApi.getAll();
        return Array.isArray(response) ? response : 
               response?.employees ? response.employees : 
               response?.data ? response.data : [];
      } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
      }
    },
  });
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
       queryFn: employeeApi.getAll,
  //   queryFn: userApi.getAll,
  });


  const loadDeptEmployees = async (viewingDepartmentId: number) => {
      try {
        const employees = await departmentApi.getDepartmentEmployees(viewingDepartmentId);
        setDepartmentEmployees(employees);
        setIsLoadingEmployees(false)
      } catch (error) {
        console.error('Error loading project employees:', error);
        toast({
          title: "Error",
          description: "Failed to load project employees",
          variant: "destructive"
        });
      }
    };



  useEffect(() => {
      //console.log("setAvailableEmployees",[viewingDepartmentId, departmentEmployees, allEmployees])
      if (viewingDepartmentId && departmentEmployees.length) {
        const projectEmployeeIds = departmentEmployees.map(employee => employee.id);
        const filteredEmployees = allEmployees.filter(
          employee => !projectEmployeeIds.includes(employee.id)
        );
        //console.log("filteredEmployees",filteredEmployees)
        setAvailableEmployees(filteredEmployees);
      } else {
        setAvailableEmployees(allEmployees);
      }
    }, [viewingDepartmentId, departmentEmployees, allEmployees]);



  // const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
  //   queryKey: ['employees', viewingDepartmentId],
  //   queryFn: () => viewingDepartmentId ? departmentApi.getDepartmentEmployees(viewingDepartmentId) : [],

    
  //   enabled: !!viewingDepartmentId,
  //   onSuccess: (data) => {


  //     setDepartmentEmployees(data);
  //     //console.log("departmentEmployees",departmentEmployees)
  //   },
  // });

  const createDepartmentMutation = useMutation({
    mutationFn: (departmentData: any) => departmentApi.create(departmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Department has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create department: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => departmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Department has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update department: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Success',
        description: 'Department has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete department: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const assignEmployeeToDepartmentMutation = useMutation({
    mutationFn: ({ departmentId, employeeId }: { departmentId: number, employeeId: string }) =>
      departmentApi.assignEmployee(departmentId, employeeId),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.departmentId] });

      const department = departments.find((d: any) => d.id === variables.departmentId);
      const employee = allEmployees.find((e: any) => e.id === variables.employeeId || e.employeeId === variables.employeeId);

      if (department && employee) {
        await sendDepartmentAssignmentEmail(
          employee.email,
          employee.name,
          department.name
        );
      }

      setNewEmployeeToAssign('');
      setUserToAssign('');
      toast({
        title: 'Success',
        description: 'Employee has been assigned to the department successfully.',
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

  const unassignEmployeeFromDepartmentMutation = useMutation({
    mutationFn: ({ departmentId, employeeId }: { departmentId: number, employeeId: string }) =>
      departmentApi.unassignEmployee(departmentId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees', viewingDepartmentId] });
      toast({
        title: 'Success',
        description: 'Employee has been unassigned from the department successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to unassign employee: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleAddExistingEmployee = () => {
    setShowAddExistingEmployeeDialog(true);

  };

  

  const handleConfirmAddExistingEmployee = async () => {
    if (viewingDepartmentId && userToAssign) {
      //console.log("userToAssign",userToAssign)
      // assignEmployeeToDepartmentMutation.mutate({
      //   departmentId: viewingDepartmentId,
      //   employeeId: userToAssign,
      // });
      const data = {"employeeId":parseInt(userToAssign),"departmentname":getDepartmentName(viewingDepartmentId)}
      try{
        await departmentApi.assignEmployee(viewingDepartmentId, data);
          setShowAddExistingEmployeeDialog(false);
          if (viewingDepartmentId) {
            loadDeptEmployees(viewingDepartmentId);
          }
      }catch(error){
        console.error('Error assigning employee:', error);
        toast({
          title: "Error",
          description: "Failed to assign employee to project",
          variant: "destructive"
        });
      }
      
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description) {
      toast({
        title: 'Warning',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const departmentData = {
      name,
      description,
      coordinates,
    };

    setFormData(departmentData);

    if (isEditing && editingId) {
      setShowUpdateConfirm(true);
    } else {
      setShowCreateConfirm(true);
    }
  };

  const confirmCreateDepartment = () => {
    createDepartmentMutation.mutate(formData);
    setShowCreateConfirm(false);
  };

  const confirmUpdateDepartment = () => {
    if (editingId) {
      updateDepartmentMutation.mutate({ id: editingId, data: formData });
      setShowUpdateConfirm(false);
    }
  };

  const handleDeleteClick = (departmentId: number) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDepartment = () => {
    if (departmentToDelete) {
      deleteDepartmentMutation.mutate(departmentToDelete);
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    }
  };

  const handleEdit = (department: any) => {
    setName(department.name);
    setDescription(department.description);
    setCoordinates(department.coordinates || []);
    //console.log("department.coordinates",department.coordinates)
    setEditingId(department.id);
    setIsEditing(true);
  };

  const handleOpenAssignDialog = (departmentId: number) => {
    setSelectedDepartmentId(departmentId);
    setShowAssignDialog(true);
  };

  const handleAssignEmployee = () => {
    if (selectedDepartmentId && selectedEmployeeId) {
      setShowAssignConfirm(true);
    }
  };

  const confirmAssignEmployee = () => {
    if (selectedDepartmentId && selectedEmployeeId) {
      assignEmployeeToDepartmentMutation.mutate({
        departmentId: selectedDepartmentId,
        employeeId: selectedEmployeeId,
      });
      setShowAssignConfirm(false);
      setSelectedEmployeeId('');
    }
  };

  const handlePolygonComplete = (coords: { lat: number; lng: number }[]) => {
    setCoordinates(coords);
    toast({
      title: 'Success',
      description: 'Location boundary has been marked successfully.',
    });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setLocationId('');
    setRequiredStaffing('');
    setCoordinates([]);
    setEditingId(null);
    setIsEditing(false);
  };

  const getDepartmentName = (id: number) => {
    return departments.find((d: any) => d.id === id)?.name || '';
  };

  const getEmployeeName = (id: string) => {
    return allEmployees.find((e: any) => e.id === id || e.employeeId === id)?.name || '';
  };

  const getUserName = (id: string) => {
    return users.find((user: any) => user.id === id)?.name || '';
  };

  const handleViewEmployees = (departmentId: number) => {
    setViewingDepartmentId(departmentId);
    setShowViewEmployeesDialog(true);
    loadDeptEmployees(departmentId)
  };

  const handleUnassignEmployee = (employeeId: string) => {
    if (viewingDepartmentId) {
      unassignEmployeeFromDepartmentMutation.mutate({
        departmentId: viewingDepartmentId,
        employeeId: employeeId,
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('departmentManagement')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? t('updateDepartment') : t('createDepartment')}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('departmentName')}</Label>
                  <Input
                    id="name"
                    placeholder={t('enterDepartmentName')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('enterDepartmentDescription')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('departmentBoundary')}</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <LocationMap onPolygonComplete={handlePolygonComplete} initialCoordinates={coordinates} />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetForm} type="button">
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}
                >
                  {(createDepartmentMutation.isPending || updateDepartmentMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? t('updateDepartment') : t('createDepartment')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('departments')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDepartments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : departments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium text-gray-500">{t('noDepartmentsFound')}</h3>
                  <p className="text-gray-400">{t('createDepartmentToStart')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('name')}</TableHead>
                        <TableHead>{t('description')}</TableHead>
                        <TableHead>{t('location')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((department: any) => (
                        <TableRow key={department.id}>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell className="font-medium">{department.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {department.location}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEmployees(department.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(department)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(department.id)}
                                disabled={deleteDepartmentMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Employees Dialog */}
      <Dialog open={showViewEmployeesDialog} onOpenChange={setShowViewEmployeesDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('departmentEmployees')}</DialogTitle>
            <DialogDescription>
              {viewingDepartmentId && getDepartmentName(viewingDepartmentId)} {t('employees')}
            </DialogDescription>
          </DialogHeader>
          {isLoadingEmployees ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : departmentEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-400">{t('noEmployeesInDepartment')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('email')}</TableHead>
                      <TableHead>{t('phone')}</TableHead>
                      {/* <TableHead className="text-right">{t('actions')}</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentEmployees.map((employee: any) => (
                      <TableRow key={employee.id || employee.employeeId}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        {/* <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnassignEmployee(employee.id || employee.employeeId)}
                            disabled={unassignEmployeeFromDepartmentMutation.isPending}
                          >
                            {unassignEmployeeFromDepartmentMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('unassign')}
                          </Button>
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter className="justify-between">
            <Button variant="outline" onClick={() => setShowViewEmployeesDialog(false)}>
              {t('close')}
            </Button>
            <Button onClick={handleAddExistingEmployee}>
              {t('addEmployee')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Existing Employee Dialog */}
      <Dialog open={showAddExistingEmployeeDialog} onOpenChange={setShowAddExistingEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addExistingEmployee')}</DialogTitle>
            <DialogDescription>{t('selectUserToAddAsEmployee')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">{t('user')}</Label>
              <Select value={userToAssign} onValueChange={setUserToAssign}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectUser')} />
                </SelectTrigger>
                 <SelectContent position="popper" className="w-full bg-white">
        {Array.isArray(availableEmployees) && availableEmployees.length > 0 ? (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExistingEmployeeDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleConfirmAddExistingEmployee} disabled={!userToAssign || assignEmployeeToDepartmentMutation.isPending}>
              {assignEmployeeToDepartmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Department Confirmation Dialog */}
      <Dialog open={showCreateConfirm} onOpenChange={setShowCreateConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmDepartmentCreation')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('areYouSureCreateDepartment')}</p>
            <div className="mt-4 space-y-2">
              <p><span className="font-medium">{t('name')}:</span> {formData.name}</p>
              <p><span className="font-medium">{t('description')}:</span> {formData.description}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateConfirm(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={confirmCreateDepartment}>
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Department Confirmation Dialog */}
      <Dialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmDepartmentUpdate')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('areYouSureUpdateDepartment')}</p>
            <div className="mt-4 space-y-2">
              <p><span className="font-medium">{t('name')}:</span> {formData.name}</p>
              <p><span className="font-medium">{t('description')}:</span> {formData.description}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateConfirm(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={confirmUpdateDepartment}>
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmDepartmentDeletion')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('areYouSureDeleteDepartment')}</p>
            {departmentToDelete && (
              <p className="mt-2 font-medium">
                {t('department')}: {getDepartmentName(departmentToDelete)}
              </p>
            )}
            <p className="mt-2 text-red-500">{t('thisActionCannotBeUndone')}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDepartment}
              disabled={deleteDepartmentMutation.isPending}
            >
              {deleteDepartmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Employee Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('assignEmployee')}</DialogTitle>
            <DialogDescription>
              {t('assignEmployeeToDepartment')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('department')}</Label>
              <Input
                value={selectedDepartmentId ? getDepartmentName(selectedDepartmentId) : ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee">{t('employee')}</Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((employee: any) => (
                    <SelectItem
                      key={employee.id || employee.employeeId}
                      value={employee.id || employee.employeeId}
                    >
                      {employee.name} ({employee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleAssignEmployee}
              disabled={!selectedEmployeeId || assignEmployeeToDepartmentMutation.isPending}
            >
              {assignEmployeeToDepartmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('assign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Employee Confirmation Dialog */}
      <Dialog open={showAssignConfirm} onOpenChange={setShowAssignConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmEmployeeAssignment')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('areYouSureAssignEmployee')}</p>
            {selectedDepartmentId && selectedEmployeeId && (
              <div className="mt-4 space-y-2">
                <p><span className="font-medium">{t('department')}:</span> {getDepartmentName(selectedDepartmentId)}</p>
                <p><span className="font-medium">{t('employee')}:</span> {getEmployeeName(selectedEmployeeId)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignConfirm(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={confirmAssignEmployee}>
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;