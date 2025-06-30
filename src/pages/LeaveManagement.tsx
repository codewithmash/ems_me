import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi, employeeApi } from '@/services/api';
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
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CalendarDays, 
  UserCheck, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { sendLeaveRequestEmail, sendLeaveStatusEmail } from '@/utils/email';
import { useLanguage } from '@/contexts/LanguageContext';

// Leave types
const LEAVE_TYPES = [
  { id: 'annual', label: 'Annual Leave' },
  { id: 'sick', label: 'Sick Leave' },
  { id: 'personal', label: 'Personal Leave' },
  { id: 'bereavement', label: 'Bereavement Leave' },
  { id: 'unpaid', label: 'Unpaid Leave' },
  { id: 'other', label: 'Other' }
];

interface Leave {
  id: number;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  rejectionReason?: string;
}

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
}

const LeaveManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [leaveType, setLeaveType] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch leaves and employees
  const { data: leaves = [], isLoading: isLoadingLeaves } = useQuery<Leave[]>({
    queryKey: ['leaves'],
    queryFn: () => leaveApi.getAll(),
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => employeeApi.getAll(),
  });

  // Create leave mutation
  const createLeaveMutation = useMutation({
    mutationFn: (leaveData: Omit<Leave, 'id' | 'status' | 'submittedAt'>) => 
      leaveApi.create(leaveData),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      
      // Find the employee for email notification
      const employee = employees.find((e) => e.id === employeeId || e.employeeId === employeeId);
      
      if (employee) {
        // Send email notification to admin
        await sendLeaveRequestEmail(
          'admin@shifttrack.com',
          employee.name,
          LEAVE_TYPES.find(lt => lt.id === leaveType)?.label || leaveType,
          startDate,
          endDate,
          reason
        );
      }
      
      resetForm();
      toast({
        title: t('success'),
        description: t('leaveRequestSubmitted'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: t('leaveRequestFailed') + error.message,
        variant: 'destructive',
      });
    },
  });

  // Update leave status mutation
  const updateLeaveStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number, status: 'approved' | 'rejected', reason?: string }) => 
      leaveApi.updateStatus(id, status, reason),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      
      // Find the leave and employee for email notification
      const leave = leaves.find((l) => l.id === variables.id);
      if (leave) {
        const employee = employees.find((e) => e.id === leave.employeeId || e.employeeId === leave.employeeId);
        
        // if (employee) {
        //   // Send email notification
        //   await sendLeaveStatusEmail(
        //     employee.email,
        //     employee.name,
        //     variables.status,
        //     leave.leaveType,
        //     format(new Date(leave.startDate), 'PPP'),
        //     format(new Date(leave.endDate), 'PPP'),
        //     variables.reason
        //   );
        // }
      }
      
      toast({
        title: t('success'),
        description: t('leaveStatusUpdated') + variables.status,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: t('leaveStatusUpdateFailed') + error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      toast({
        title: t('warning'),
        description: t('fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    const leaveData = {
      employeeId,
      leaveType: LEAVE_TYPES.find(lt => lt.id === leaveType)?.label || leaveType,
      startDate,
      endDate,
      reason,
    };

    createLeaveMutation.mutate(leaveData);
  };

  const handleApprove = (id: number) => {
    updateLeaveStatusMutation.mutate({ id, status: 'approved' });
  };

  const openRejectDialog = (id: number) => {
    setSelectedLeaveId(id);
    setShowRejectDialog(true);
  };

  const handleReject = () => {
    if (selectedLeaveId) {
      updateLeaveStatusMutation.mutate({ 
        id: selectedLeaveId, 
        status: 'rejected',
        reason: rejectReason 
      });
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedLeaveId(null);
    }
  };

  const resetForm = () => {
    setEmployeeId('');
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-500">{t('approved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">{t('rejected')}</Badge>;
      default:
        return <Badge className="bg-yellow-500">{t('pending')}</Badge>;
    }
  };

  // Filter leaves by status
  const filteredLeaves = leaves.filter((leave) => {
    //console.log("leaves",leaves)
    return leave.status.toLowerCase() === activeTab;
  });

  // Find employee name by ID
  const getEmployeeName = (id: string) => {
    const employee = employees.find((e) => e.id === id || e.employeeId === id);
    // console.log("employee",employee)
    return employee ? employee.name : t('unknownEmployee');
  };

  const getEmployeeDetails = (id: string) => {
    const employee = employees.find((e) => e.id === id || e.employeeId === id);
    // console.log("employee",employee)
    return employee;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('leaveManagement')}</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('leaveRequests')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="pending" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="pending">{t('pending')}</TabsTrigger>
                  <TabsTrigger value="approved">{t('approved')}</TabsTrigger>
                  <TabsTrigger value="rejected">{t('rejected')}</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {isLoadingLeaves ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : filteredLeaves.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md">
                      <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-500">{t('noPendingRequests')}</h3>
                    </div>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <Card key={leave.id} className="overflow-hidden">
                        <CardHeader className="pb-2 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-base">{getEmployeeDetails(leave.employeeId)?.name}({getEmployeeDetails(leave.employeeId)?.email})</CardTitle>
                             
                              <p className="text-xs text-gray-500">
                                {t('submitted')}: {leave.requested_date}
                              </p>
                            </div>
                            {getStatusBadge(leave.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                             <div>
                                 <p className="text-xs text-gray-500">Department</p>
                                 <p className="font-medium"> {getEmployeeDetails(leave.employeeId)?.department}</p>
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500">Project</p>
                                 <p className="font-medium"> {getEmployeeDetails(leave.employeeId)?.project_assigned}</p>
                              </div>
                            <div>
                              <p className="text-xs text-gray-500">{t('leaveType')}</p>
                              <p className="font-medium">{leave.leave_type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">{t('duration')}</p>
                              <p className="font-medium">
                                {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reason')}</p>
                            <p className="text-sm">{leave.reason}</p>
                          </div>
                        </CardContent>
                        {activeTab === 'pending' && (
                          <CardFooter className="bg-gray-50 gap-2">
                            <Button 
                              variant="outline"
                              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                              onClick={() => openRejectDialog(leave.id)}
                              disabled={updateLeaveStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {t('reject')}
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                              onClick={() => handleApprove(leave.id)}
                              disabled={updateLeaveStatusMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              {t('approve')}
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                  {isLoadingLeaves ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : filteredLeaves.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md">
                      <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-500">{t('noApprovedRequests')}</h3>
                    </div>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <Card key={leave.id} className="overflow-hidden">
                        <CardHeader className="pb-2 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-base">{getEmployeeDetails(leave.employeeId)?.name}({getEmployeeDetails(leave.employeeId)?.email})</CardTitle>
                              
                              
                              <p className="text-xs text-gray-500">
                                {t('submitted')}: {leave.requested_date}
                              </p>
                            </div>
                            {getStatusBadge(leave.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                 <p className="text-xs text-gray-500">Department</p>
                                 <p className="font-medium"> {getEmployeeDetails(leave.employeeId)?.department}</p>
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500">Project</p>
                                 <p className="font-medium"> {getEmployeeDetails(leave.employeeId)?.project_assigned}</p>
                              </div>
                            <div>
                              <p className="text-xs text-gray-500">{t('leaveType')}</p>
                              <p className="font-medium">{leave.leave_type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">{t('duration')}</p>
                              <p className="font-medium">
                                {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reason')}</p>
                            <p className="text-sm">{leave.reason}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                  {isLoadingLeaves ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : filteredLeaves.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md">
                      <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-500">{t('noRejectedRequests')}</h3>
                    </div>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <Card key={leave.id} className="overflow-hidden">
                        <CardHeader className="pb-2 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-base">{getEmployeeDetails(leave.employeeId)?.name}({getEmployeeDetails(leave.employeeId)?.email})</CardTitle>
                              
                              <p className="text-xs text-gray-500">
                                {t('submitted')}: {leave.requested_date}
                              </p>
                            </div>
                            {getStatusBadge(leave.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                 <p className="text-xs text-gray-500">Department</p>
                                 <p className="font-medium"> {getEmployeeDetails(leave.employeeId)?.department}</p>
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500">Project</p>
                                 <p className="font-medium"> {getEmployeeDetails(leave.employeeId)?.project_assigned}</p>
                              </div>
                            <div>
                              <p className="text-xs text-gray-500">{t('leaveType')}</p>
                              <p className="font-medium">{leave.leave_type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">{t('duration')}</p>
                              <p className="font-medium">
                                {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reason')}</p>
                            <p className="text-sm">{leave.reason}</p>
                          </div>
                          {leave.rejection_reason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                              <p className="text-xs text-gray-500">{t('rejectionReason')}</p>
                              <p className="text-red-600">{leave.rejection_reason}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Rejection reason dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectLeaveRequest')}</DialogTitle>
            <DialogDescription>
              {t('provideRejectionReason')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder={t('rejectionReasonPlaceholder')}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={!rejectReason.trim() || updateLeaveStatusMutation.isPending}
            >
              {updateLeaveStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('confirmRejection')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveManagement;