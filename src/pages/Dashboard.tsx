
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { employeeApi, projectApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';



const Dashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    pendingRegistrations: 0
  });
  const [employees, setEmployees] = useState([]);
  const [pendingemp,setPendingemp]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const employeesResponse = await employeeApi.getAll();
        const projectsData = await projectApi.getAll();
        
        // Calculate stats
        const ongoingProjects = projectsData.filter(p => p.status === 'In Progress').length;
        const completedProjects = projectsData.filter(p => p.status === 'Completed').length;
        const employeesData = employeesResponse.employees || [];
       
        const pendingRegistrations = employeesData.length;
        
        setEmployees(employeesData);

 
        const pendData = employeesData.filter(e => e.face_data_status != "approved" && e.face_data_status != "rejected" && e.is_face_registered == true )

        setPendingemp(pendData)

        setStats({
          totalEmployees: employeesData.length,
          totalProjects: projectsData.length,
          ongoingProjects,
          completedProjects,
          pendingRegistrations
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: t('error'),
          description: t('errorFetchingDashboardData'),
          variant: 'destructive'
        });
        
        // For demo/development, provide fallback data if API fails
        setEmployees([
          { id: 1, name: 'John Doe', employeeId: 'EMP001', phone: '555-1234', email: 'john@example.com', project: 'Project A', biometricVerified: true, photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg', isRegistered: true },
          { id: 2, name: 'Jane Smith', employeeId: 'EMP002', phone: '555-5678', email: 'jane@example.com', project: 'Project B', biometricVerified: false, photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg', isRegistered: false },
          { id: 3, name: 'Michael Brown', employeeId: 'EMP003', phone: '555-9012', email: 'michael@example.com', project: 'Project A', biometricVerified: true, photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg', isRegistered: true },
        ]);
        
        setStats({
          totalEmployees: 3,
          totalProjects: 2,
          ongoingProjects: 2,
          completedProjects: 0,
          pendingRegistrations: 1
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t, toast]);

  const handleOpenEmployeeInfo = (employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  function displayBase64Image(base64String, mimeType) {
    
    // Remove data URL scheme if present
    const base64Data = base64String.replace(/^data:.+;base64,/, '');
    
    // Create the data URL
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return dataUrl
    
    // Create an image element
    // const img = document.createElement('img');
    // img.src = dataUrl;
    // img.alt = "Converted image from Base64";
    
    // // Clear previous content and append the image
    // const container = document.getElementById('imageContainer');
    // container.innerHTML = '';
    // container.appendChild(img);
    }
  const mimeType = "image/jpeg"; 

  
  const handleApproveRegistration = async () => {
    try {
      if (!selectedEmployee) return;
      
      // In a real app, you would call an API to update the employee registration status
      // await employeeApi.update(selectedEmployee.id, {
      //   ...selectedEmployee,
      //   isRegistered: true
      // });


      await employeeApi.approveOrRejectUser(selectedEmployee.employee_id,{"approvalStatus":"approved"})
      
      toast({
        title: t('success'),
        description: t('registrationApproved'),
      });
      
      // Update local state
      // setEmployees(employees.map(emp => 
      //   emp.id === selectedEmployee.id ? {...emp, isRegistered: true} : emp
      // ));

      const employeesData = await employeeApi.getAll();
      setEmployees(employeesData);

      const pendData = employeesData.filter(e => e.face_data_status != "approved" && e.face_data_status != "rejected"  && e.is_face_registered == true )

      setPendingemp(pendData)


      
       const projectsData = await projectApi.getAll();
       
       // Calculate stats
       const ongoingProjects = projectsData.filter(p => p.status === 'In Progress').length;
       const completedProjects = projectsData.filter(p => p.status === 'Completed').length;
       const pendingRegistrations = employeesData.filter(e => e.face_data_status != "approved" && e.face_data_status != "rejected" ).length;
       
       setEmployees(employeesData);

       

       

       setStats({
         totalEmployees: employeesData.length,
         totalProjects: projectsData.length,
         ongoingProjects,
         completedProjects,
         pendingRegistrations
       });
      
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error approving registration:', error);
      toast({
        title: t('error'),
        description: t('errorApprovingRegistration'),
        variant: 'destructive'
      });
    }
  };
  
  const handleRejectRegistration = async () => {
    try {
      if (!selectedEmployee) return;
      
      // In a real app, you would call an API to update or delete the employee registration
      // await employeeApi.update(selectedEmployee.id, {
      //   ...selectedEmployee,
      //   isRegistered: false,
      //   isRejected: true
      // });

      await employeeApi.approveOrRejectUser(selectedEmployee.employee_id,{"approvalStatus":"rejected"})
      
      toast({
        title: t('info'),
        description: t('registrationRejected'),
      });

      const employeesData = await employeeApi.getAll();
      setEmployees(employeesData);

      const pendData = employeesData.filter(e => e.face_data_status != "approved" && e.face_data_status != "rejected" )

      setPendingemp(pendData)

      
      
      // Update local state
      // setEmployees(employees.map(emp => 
      //   emp.id === selectedEmployee.id ? {...emp, isRegistered: false, isRejected: true} : emp
      // ));
      
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast({
        title: t('error'),
        description: t('errorRejectingRegistration'),
        variant: 'destructive'
      });
    }
  };
  
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              {t('totalEmployees')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-800">{stats.totalEmployees}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-green-600" />
              {t('totalProjects')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-800">{stats.totalProjects}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-amber-600" />
              {t('ongoingProjects')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-800">{stats.ongoingProjects}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-purple-600" />
              {t('completedProjects')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-800">{stats.completedProjects}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-rose-600" />
              {t('pendingRegistrations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-rose-800">{stats.pendingRegistrations}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('employeeVerificationStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('employeeId')}</TableHead>
                <TableHead>{t('phone')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                {/* <TableHead>{t('project')}</TableHead> */}
                <TableHead>{t('biometricVerification')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingemp.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.employee_id}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  {/* <TableCell>{employee.project}</TableCell> */}
                  <TableCell>
                    {/* {employee.biometricVerified ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t('verified')}
                      </Badge>
                    { ) : ( */}
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {t('pending')}
                      </Badge>
                    {/* )} } */}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenEmployeeInfo(employee)}
                      className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Info className="h-4 w-4 mr-1" />
                      {t('info')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee Info Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('employeeInformation')}</DialogTitle>
            <DialogDescription>
              {!selectedEmployee?.isRegistered && !selectedEmployee?.isRejected 
                ? t('reviewAndApproveRegistration') 
                : t('employeeDetails')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="grid gap-4">
              <div className="flex justify-center">
                <div className="rounded-full overflow-hidden w-32 h-32 border-4 border-blue-100">
                  <img 
                    src={displayBase64Image(selectedEmployee.face_data_base_64,mimeType)|| 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                    alt={selectedEmployee.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">{t('name')}:</div>
                <div>{selectedEmployee.name}</div>
                
                <div className="font-semibold">{t('employeeId')}:</div>
                <div>{selectedEmployee.employee_id}</div>
                
                <div className="font-semibold">{t('email')}:</div>
                <div>{selectedEmployee.email}</div>
                
                <div className="font-semibold">{t('phone')}:</div>
                <div>{selectedEmployee.phone}</div>
                
                {/* <div className="font-semibold">{t('project')}:</div>
                <div>{selectedEmployee.project}</div> */}
                
                {/* <div className="font-semibold">{t('biometricVerification')}:</div>
                <div>
                  {selectedEmployee.biometricVerified 
                    ? <span className="text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> {t('verified')}</span>
                    : <span className="text-amber-600 flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> {t('pending')}</span>
                  }
                </div> */}
                
                {/* <div className="font-semibold">{t('registrationStatus')}:</div>
                <div>
                  {selectedEmployee.isRegistered 
                    ? <span className="text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> {t('approved')}</span>
                    : selectedEmployee.isRejected 
                      ? <span className="text-red-600 flex items-center"><X className="h-3 w-3 mr-1" /> {t('rejected')}</span>
                      : <span className="text-amber-600 flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> {t('pending')}</span>
                  }
                </div> */}
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            {selectedEmployee && !selectedEmployee.isRegistered && !selectedEmployee.isRejected && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectRegistration}
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('reject')}
                </Button>
                
                <Button 
                  variant="default"
                  onClick={handleApproveRegistration}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {t('approve')}
                </Button>
              </>
            )}
            {(selectedEmployee?.isRegistered || selectedEmployee?.isRejected) && (
              <Button 
                variant="default" 
                onClick={() => setIsDialogOpen(false)}
                className="w-full"
              >
                {t('close')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default Dashboard;