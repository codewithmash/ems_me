import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi, employeeApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, FileDown, Calendar, ArrowLeft, UserRound, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const EmployeeAttendance = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [month, setMonth] = useState<Date | undefined>(new Date());
  
  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeeApi.getById(employeeId || ''),
    enabled: !!employeeId,
  });
  
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', employeeId, month],
    queryFn: () => attendanceApi.getByEmployee(employeeId || ''),
    enabled: !!employeeId,
  });
  
  const filteredAttendance = month 
    ? attendanceRecords.filter((record: any) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getMonth() === month.getMonth() &&
          recordDate.getFullYear() === month.getFullYear()
        );
      })
    : attendanceRecords;
  
  const exportToPDF = (type: 'monthly' | 'full') => {
    const employeeName = employee?.name || 'Employee';
    const reportTitle = type === 'monthly' 
      ? `Monthly Attendance Report - ${format(month || new Date(), 'MMMM yyyy')}`
      : 'Complete Attendance Report';
    
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`${reportTitle}: ${employeeName}`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Employee ID: ${employee?.employeeId || employee?.id}`, 14, 32);
    if (employee?.department) {
      doc.text(`Department: ${employee.department}`, 14, 40);
    }
    
    const records = type === 'monthly' ? filteredAttendance : attendanceRecords;
    const tableColumn = ["Date", "Status", "Check In", "Check Out", "Duration"];
    const tableRows = records.map((record: any) => [
      format(new Date(record.date), 'PP'),
      record.status,
      record.checkInTime || 'N/A',
      record.checkOutTime || 'N/A',
      record.checkInTime && record.checkOutTime 
        ? calculateDuration(record.checkInTime, record.checkOutTime)
        : 'N/A',
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: employee?.department ? 48 : 40,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    doc.save(`${employeeName}_${type === 'monthly' ? 'Monthly' : 'Complete'}_Attendance.pdf`);
  };
  
  const exportToExcel = (type: 'monthly' | 'full') => {
    const employeeName = employee?.name || 'Employee';
    const records = type === 'monthly' ? filteredAttendance : attendanceRecords;
    
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((record: any) => ({
        Date: format(new Date(record.date), 'PP'),
        Status: record.status,
        'Check In': record.checkInTime || 'N/A',
        'Check Out': record.checkOutTime || 'N/A',
        Duration: record.checkInTime && record.checkOutTime 
          ? calculateDuration(record.checkInTime, record.checkOutTime)
          : 'N/A',
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    
    XLSX.writeFile(workbook, `${employeeName}_${type === 'monthly' ? 'Monthly' : 'Complete'}_Attendance.xlsx`);
  };
  
  const calculateDuration = (checkIn: string, checkOut: string) => {
    try {
      const [checkInHours, checkInMinutes] = checkIn.split(':').map(Number);
      const [checkOutHours, checkOutMinutes] = checkOut.split(':').map(Number);
      
      let durationMinutes = (checkOutHours * 60 + checkOutMinutes) - (checkInHours * 60 + checkInMinutes);
      
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }
      
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return 'Invalid';
    }
  };
  
  const calculateStats = () => {
    if (!filteredAttendance.length) return { present: 0, absent: 0, late: 0, total: 0 };
    
    const present = filteredAttendance.filter((a: any) => a.status === 'present').length;
    const absent = filteredAttendance.filter((a: any) => a.status === 'absent').length;
    const late = filteredAttendance.filter((a: any) => a.status === 'late').length;
    
    return {
      present,
      absent,
      late,
      total: filteredAttendance.length
    };
  };
  
  const stats = calculateStats();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/attendance-report')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Employee Attendance</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-1" />
                Export Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToExcel('monthly')}>
                <FileText className="h-4 w-4 mr-2" />
                Export Monthly Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF('monthly')}>
                <Download className="h-4 w-4 mr-2" />
                Export Monthly PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel('full')}>
                <FileText className="h-4 w-4 mr-2" />
                Export Complete Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF('full')}>
                <Download className="h-4 w-4 mr-2" />
                Export Complete PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {isLoadingEmployee ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !employee ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserRound className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">Employee Not Found</h2>
            <p className="text-gray-500 mb-4">The employee you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/attendance-report')}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Employee Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{employee.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-medium">{employee.employeeId || employee.id}</p>
                  </div>
                  {employee.department && (
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{employee.department}</p>
                    </div>
                  )}
                  {employee.designation && (
                    <div>
                      <p className="text-sm text-gray-500">Designation</p>
                      <p className="font-medium">{employee.designation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                  <p className="text-sm text-gray-500 ml-2">days</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.total ? Math.round((stats.present / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                  <p className="text-sm text-gray-500 ml-2">days</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.total ? Math.round((stats.absent / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Late</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
                  <p className="text-sm text-gray-500 ml-2">days</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.total ? Math.round((stats.late / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Attendance Records</h2>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <DatePicker
                date={month}
                onDateChange={setMonth}
                mode="month"
                placeholder="Select month"
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {isLoadingAttendance ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredAttendance.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">No attendance records found</h3>
                  <p className="text-gray-400 mt-1">No records for the selected period</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendance.sort((a: any, b: any) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                      }).map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>{format(new Date(record.date), 'PP')}</TableCell>
                          <TableCell>
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'present' 
                                  ? 'bg-green-100 text-green-800'
                                  : record.status === 'absent'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>{record.checkInTime || '-'}</TableCell>
                          <TableCell>{record.checkOutTime || '-'}</TableCell>
                          <TableCell>
                            {record.checkInTime && record.checkOutTime 
                              ? calculateDuration(record.checkInTime, record.checkOutTime)
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EmployeeAttendance;
