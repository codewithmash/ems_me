import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { attendanceApi, employeeApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Calendar, User, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import SearchableSelect from '@/components/SearchableSelect';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { useLanguage } from '@/contexts/LanguageContext';

import 'jspdf-autotable';

import autoTable from 'jspdf-autotable';



const AttendanceReport = () => {
  const {t}  = useLanguage()
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [showExportConfirmation, setShowExportConfirmation] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [exportType, setExportType] = useState<'daily' | 'all'>('daily');
  
  // Format date for API query
  const formattedDate = selectedDate 
    ? format(selectedDate, 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');
  
  // Fetch attendance data for selected date or all data for selected employee
  const { data: attendanceData = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', formattedDate, selectedEmployee],
    queryFn: () => {
      if (selectedEmployee === 'all') {
        return attendanceApi.getByDate(formattedDate);
      } else {
        return attendanceApi.getByEmployee(selectedEmployee);
      }
    },
  });
  
  // Fetch employees
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
  queryKey: ['employees'],
  queryFn: async () => {
    try {
      const response = await employeeApi.getAll();
      // Handle different response formats
      return Array.isArray(response) ? response : 
             response?.employees ? response.employees : 
             response?.data ? response.data : [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return []; // Return empty array on error
    }
  },
});
  
  // Filter attendance data based on selected employee and date (if viewing all employees)
const filteredAttendanceData = React.useMemo(() => {
  if (!Array.isArray(attendanceData)) return [];
  
  if (selectedEmployee === 'all') {
    return attendanceData;
  } else {
    return attendanceData.filter((record: any) => 
      record.employee_id === selectedEmployee || 
      record.employeeId === selectedEmployee
    ); 
  }
}, [attendanceData, selectedEmployee]);
  
  // Calculate attendance statistics
  const stats = React.useMemo(() => {
    if (selectedEmployee === 'all') {
      // For "All Employees" view, calculate daily stats
      if (!filteredAttendanceData.length) return { present: 0, absent: 0, late: 0, total: employees.length };
      
      const present = filteredAttendanceData.length;
      const late = filteredAttendanceData.filter((a: any) => a.status === 'late').length;
      const absent = employees.length - present;

      return { present, absent, late, total: employees.length };
            
      // return {
      //   present,
      //   absent,
      //   late,
      //   total: employees.length
      // };
    } else {
      // For specific employee, calculate overall stats
      if (!filteredAttendanceData.length) return { present: 0, absent: 0, late: 0, total: 0 };
      
      const present = filteredAttendanceData.filter((a: any) => a.status === 'present').length;
      const absent = filteredAttendanceData.filter((a: any) => a.status === 'absent').length;
      const late = filteredAttendanceData.filter((a: any) => a.status === 'late').length;
      const total = filteredAttendanceData.length;
      
      return {
        present,
        absent,
        late,
        total
      };
    }
  }, [filteredAttendanceData, employees.length, selectedEmployee]);

  // Get employee name by ID
 const getEmployeeName = (employeeId: string) => {
  if (!Array.isArray(employees)) return 'Unknown';
  
  const employee = employees.find((e: any) => 
    e.employee_id == employeeId || e.id == employeeId
  );
  return employee?.name || 'Unknown';
};
  
  // Navigate to employee attendance details
  const viewEmployeeAttendance = (employeeId: string) => {
    navigate(`/employee-attendance/${employeeId}`);
  };

  // Prepare employee options for searchable dropdown
const employeeOptions = React.useMemo(() => {
  const baseOptions = [{ value: 'all', label: 'All Employees' }];
  
  if (!Array.isArray(employees)) return baseOptions;
  
  return [
    ...baseOptions,
    ...employees.map((employee: any) => ({
      value: employee.employee_id || employee.id || '',
      label: employee.name || 'Unknown'
    }))
  ];
}, [employees]);

  // Export attendance as PDF
  // const exportToPDF = () => {
  //   const doc = new jsPDF();
    
  //   let title: string;
  //   let subtitle: string;
    
  //   if (selectedEmployee === 'all') {
  //     title = `Daily Attendance Report - ${format(selectedDate || new Date(), 'PP')}`;
  //     subtitle = `Showing all employees for ${format(selectedDate || new Date(), 'PP')}`;
  //   } else {
  //     const employeeName = getEmployeeName(selectedEmployee);
  //     title = `Employee Attendance Report - ${employeeName}`;
  //     subtitle = `Showing all attendance records for ${employeeName}`;
  //   }
    
  //   doc.setFontSize(16);
  //   doc.text(title, 20, 20);
  //   doc.setFontSize(12);
  //   doc.text(subtitle, 20, 28);
  //   doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, 36);
    
  //   // Add statistics
  //   doc.setFontSize(14);
  //   doc.text('Attendance Summary', 20, 50);
  //   doc.setFontSize(10);
  //   doc.text(`Total Records: ${stats.total}`, 20, 60);
  //   doc.text(`Present: ${stats.present} (${Math.round((stats.present / stats.total) * 100) || 0}%)`, 20, 65);
  //   doc.text(`Absent: ${stats.absent} (${Math.round((stats.absent / stats.total) * 100) || 0}%)`, 20, 70);
  //   doc.text(`Late: ${stats.late} (${Math.round((stats.late / stats.total) * 100) || 0}%)`, 20, 75);
    
  //   // Add table
  //   const tableHeaders = selectedEmployee === 'all' 
  //     ? ['Employee ID', 'Name', 'Status', 'Check In', 'Check Out']
  //     : ['Date', 'Status', 'Check In', 'Check Out'];
    
  //   const tableData = filteredAttendanceData.map((record: any) => {
  //     if (selectedEmployee === 'all') {
  //       return [
  //         record.employeeId,
  //         getEmployeeName(record.employeeId),
  //         // record.status.charAt(0).toUpperCase() + record.status.slice(1),
  //         record.status,
  //         record.checkinTime || '-',
  //         record.checkoutTime || '-'
  //       ];
  //     } else {
  //       return [
  //         format(new Date(record.date), 'PP'),
  //         // record.status.charAt(0).toUpperCase() + record.status.slice(1),
  //         record.status,
  //         record.checkinTime || '-',
  //         record.checkoutTime || '-'
  //       ];
  //     }
  //   });
    
  //   // doc.autoTable({
  //   //   startY: 85,
  //   //   head: [tableHeaders],
  //   //   body: tableData,
  //   //   theme: 'grid',
  //   // });

  //   autoTable(doc, {
  //     startY: 85,
  //     head: [tableHeaders],
  //     body: tableData,
  //     theme: 'grid',
  //   });
    
  //   const fileName = selectedEmployee === 'all'
  //     ? `daily-attendance-report-${formattedDate}.pdf`
  //     : `employee-attendance-${selectedEmployee}.pdf`;
    
  //   doc.save(fileName);
  // };

   const exportToPDF = async () => {
  try {
    // console.log("t",t)
    const employeeData = employees.map(({ id, name, email, employee_id }) => ({
        id,
        name,
        email,
        employee_id
      }));
    const blob = await attendanceApi.downloadpdf({
      selectedEmployee,
      selectedDate,
      filteredAttendanceData,
      stats,
      employeeData,
      language
    });

    // Handle the blob for download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "attendance.pdf";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error:', error);
  }
};

//   const exportToPDF = async () => {
//   console.log("hello")
//   const res = await attendanceApi.downloadpdf()
//   const fontUrl = 'https://cdn.jsdelivr.net/gh/khaledhosny/amiri-font@latest/fonts/ttf/Amiri-Regular.ttf';

//     // 2. Fetch and register the font
//     const response = await fetch(fontUrl);
//     const arabicFont = await response.arrayBuffer();
//   const doc = new jsPDF();
// // doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');


//   // Use the Google font Amiri which was linked in index.html
//   doc.setFont('Amiri', 'normal');

//   let title = `تقرير الحضور اليومي - ${format(new Date(), 'PP')}`;
//   let subtitle = `عرض جميع الموظفين لـ ${format(new Date(), 'PP')}`;

//   // Set font size and text alignment (right to left for Arabic)
//   doc.setFontSize(16);
//   doc.text(title, 20, 20, { align: 'right' },{ lang: 'ar' });

//   doc.setFontSize(12);
//   doc.text(subtitle, 20, 28, { align: 'right' });

//   doc.text(`تم الإنشاء: ${format(new Date(), 'PPpp')}`, 20, 36, { align: 'right' });

//   // Add statistics or other content here as needed
//   doc.setFontSize(14);
//   doc.text('ملخص الحضور', 20, 50, { align: 'right' });

//   doc.setFontSize(10);
//   doc.text('إجمالي السجلات: 100', 20, 60, { align: 'right' });

//   // Add the table
//   const tableHeaders = ['رقم الموظف', 'الاسم', 'الحالة', 'وقت الدخول', 'وقت الخروج'];
//   const tableData = [
//     ['001', 'أحمد', 'حاضر', '8:00 AM', '5:00 PM'],
//     ['002', 'محمود', 'غائب', '-', '-']
//   ];

//   autoTable(doc, {
//     startY: 85,
//     head: [tableHeaders],
//     body: tableData,
//     theme: 'grid',
//     styles: { cellPadding: 3 },
//     columnStyles: { text: { halign: 'right' } }, // Right-align Arabic text in the table
//   });

//   // Save the PDF with the file name
//   const fileName = `تقرير الحضور اليومي-${format(new Date(), 'yyyyMMdd')}.pdf`;
//   doc.save(fileName);
// };



//   const exportToPDF = () => {
//     // Initialize jsPDF with Arabic support
//     const doc = new jsPDF();
    
//     // Add Arabic font (you'll need to load a compatible font)
//     // Note: You'll need to have the actual font file (e.g., Amiri-Regular.ttf)
//     // and load it using jsPDF's addFont method
    
//     let title: string;
//     let subtitle: string;
    
//     if (selectedEmployee === 'all') {
//       title = `تقرير الحضور اليومي - ${format(selectedDate || new Date(), 'PP')}`;
//       subtitle = `عرض جميع الموظفين ليوم ${format(selectedDate || new Date(), 'PP')}`;
//     } else {
//       const employeeName = getEmployeeName(selectedEmployee);
//       title = `تقرير حضور الموظف - ${employeeName}`;
//       subtitle = `عرض سجلات الحضور لـ ${employeeName}`;
//     }
    
//     // Set font for Arabic text
//     doc.setFont('Amiri', 'normal'); // Make sure to load this font first
//     doc.setFontSize(16);
//     doc.text(title, 20, 20, { lang: 'ar' });
//     doc.setFontSize(12);
//     doc.text(subtitle, 20, 28, { lang: 'ar' });
    
//     // English text for generated date
//     doc.setFont('helvetica', 'normal');
//     doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, 36);
    
//     // Add statistics - Arabic
//     doc.setFont('Amiri', 'normal');
//     doc.setFontSize(14);
//     doc.text('ملخص الحضور', 20, 50, { lang: 'ar' });
//     doc.setFontSize(10);
//     doc.text(`إجمالي السجلات: ${stats.total}`, 20, 60, { lang: 'ar' });
//     doc.text(`حاضر: ${stats.present} (${Math.round((stats.present / stats.total) * 100) || 0}%)`, 20, 65, { lang: 'ar' });
//     doc.text(`غائب: ${stats.absent} (${Math.round((stats.absent / stats.total) * 100) || 0}%)`, 20, 70, { lang: 'ar' });
//     doc.text(`متأخر: ${stats.late} (${Math.round((stats.late / stats.total) * 100) || 0}%)`, 20, 75, { lang: 'ar' });
    
//     // Add table
//     const tableHeaders = selectedEmployee === 'all' 
//       ? ['الرقم الوظيفي', 'الاسم', 'الحالة', 'وقت الدخول', 'وقت الخروج']
//       : ['التاريخ', 'الحالة', 'وقت الدخول', 'وقت الخروج'];
    
//     const tableData = filteredAttendanceData.map((record: any) => {
//       if (selectedEmployee === 'all') {
//         return [
//           record.employeeId,
//           getEmployeeName(record.employeeId),
//           record.status === 'present' ? 'حاضر' : 
//            record.status === 'absent' ? 'غائب' : 
//            record.status === 'late' ? 'متأخر' : record.status,
//           record.checkinTime || '-',
//           record.checkoutTime || '-'
//         ];
//       } else {
//         return [
//           format(new Date(record.date), 'PP'),
//           record.status === 'present' ? 'حاضر' : 
//            record.status === 'absent' ? 'غائب' : 
//            record.status === 'late' ? 'متأخر' : record.status,
//           record.checkinTime || '-',
//           record.checkoutTime || '-'
//         ];
//       }
//     });
    
//     autoTable(doc, {
//       startY: 85,
//       head: [tableHeaders],
//       body: tableData,
//       theme: 'grid',
//       styles: { 
//         font: 'Amiri',
//         fontStyle: 'normal',
//         halign: 'right' // Right align for Arabic
//       },
//       headStyles: {
//         halign: 'right'
//       }
//     });
    
//     const fileName = selectedEmployee === 'all'
//       ? `تقرير-الحضور-اليومي-${formattedDate}.pdf`
//       : `تقرير-حضور-الموظف-${selectedEmployee}.pdf`;
    
//     doc.save(fileName);
// };



  
  // Export attendance as Excel
  const exportToExcel = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    
    let title: string;
    let subtitle: string;
    
    if (selectedEmployee === 'all') {
      title = `Daily Attendance Report - ${format(selectedDate || new Date(), 'PP')}`;
      subtitle = `Showing all employees for ${format(selectedDate || new Date(), 'PP')}`;
    } else {
      const employeeName = getEmployeeName(selectedEmployee);
      title = `Employee Attendance Report - ${employeeName}`;
      subtitle = `Showing all attendance records for ${employeeName}`;
    }
    
    const tableData = filteredAttendanceData.map((record: any) => {
      if (selectedEmployee === 'all') {
        return {
          'Employee ID': record.employeeId,
          'Name': getEmployeeName(record.employeeId),
          // 'Status': record.status.charAt(0).toUpperCase() + record.status.slice(1),
          'Status': record.status,
          'Check In': record.checkinTime || '-',
          'Check Out': record.checkoutTime || '-'
        };
      } else {
        return {
          'Date': format(new Date(record.date), 'PP'),
          'Status': record.status,
          'Check In': record.checkinTime || '-',
          'Check Out': record.checkoutTime || '-'
        };
      }
    });
    
    const ws = XLSX.utils.json_to_sheet(tableData);
    
    // Add title and subtitle
    XLSX.utils.sheet_add_aoa(ws, [[title], [subtitle]], { origin: 'A1' });
    
    // Add statistics
    XLSX.utils.sheet_add_aoa(ws, [
      [''],
      ['Attendance Statistics'],
      [`Total Records: ${stats.total}`],
      [`Present: ${stats.present} (${Math.round((stats.present / stats.total) * 100) || 0}%)`],
      [`Absent: ${stats.absent} (${Math.round((stats.absent / stats.total) * 100) || 0}%)`],
      [`Late: ${stats.late} (${Math.round((stats.late / stats.total) * 100) || 0}%)`],
      ['']
    ], { origin: 'A3' });
    
    const wb = { Sheets: { 'Attendance': ws }, SheetNames: ['Attendance'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    const data = new Blob([excelBuffer], {type: fileType});
    const fileName = selectedEmployee === 'all'
      ? `daily-attendance-report-${formattedDate}${fileExtension}`
      : `employee-attendance-${selectedEmployee}${fileExtension}`;
    
    // Create a download link
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  // Handle export confirmation
  const handleExport = () => {
    if (exportFormat === 'pdf') {
      exportToPDF();
    } else {
      exportToExcel();
    }
    setShowExportConfirmation(false);
  };

  // Initiate export with confirmation
  const initiateExport = (format: 'pdf' | 'excel', type: 'daily' | 'all') => {
    setExportFormat(format);
    setExportType(type);
    setShowExportConfirmation(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('attendanceReport')}</h1>
        <div className="flex items-center gap-4">
          <SearchableSelect
            options={employeeOptions}
            value={selectedEmployee}
            onChange={(value) => {
              setSelectedEmployee(value);
              if (value !== 'all') {
                setSelectedDate(undefined);
              } else {
                setSelectedDate(new Date());
              }
            }}
            placeholder={t('selectEmployee')}
            searchPlaceholder={t('searchEmployee')}
            className="min-w-[200px]"
          />
          {selectedEmployee === 'all' && (
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder={t('selectDate')}
            />
          )}
        </div>
      </div> */}

<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">{t('attendanceReport')}</h1>
  <div className="flex items-center gap-4 min-w-[200px]">
    <select
      className="p-2 border rounded"
      value={selectedEmployee}
      onChange={(e) => {
        const value = e.target.value;
        setSelectedEmployee(value);
        // if (value !== 'all') {
        //   // Fetch and set employee details here
        //   fetchEmployeeDetails(value);
        // } else {
        //   // Reset or show summary view
        //   setSelectedDate(new Date());
        // }
      }}
    >
      <option value="all">{t('selectEmployee')}</option>
      {employeeOptions.map((emp) => (
        <option key={emp.value} value={emp.value}>
          {emp.label}
        </option>
      ))}
    </select>
    {selectedEmployee === 'all' && (
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder={t('selectDate')}
            />
          )}
  </div>
</div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {selectedEmployee === 'all' ? t('totalEmployees') : t('totalRecords')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('present')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-500 ml-2">
                ({Math.round((stats.present / stats.total) * 100) || 0}%)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('absent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-500 ml-2">
                ({Math.round((stats.absent / stats.total) * 100) || 0}%)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('late')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <div className="text-sm text-gray-500 ml-2">
                ({Math.round((stats.late / stats.total) * 100) || 0}%)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <div>
                {selectedEmployee === 'all' 
                  ? `${t('dailyAttendance')} - ${selectedDate ? format(selectedDate, 'PPPP') : t('today')}`
                  : `${t('employeeAttendance')} - ${getEmployeeName(selectedEmployee)}`}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileDown className="h-4 w-4 mr-2" />
                    {t('exportReport')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => initiateExport('pdf', selectedEmployee === 'all' ? 'daily' : 'all')}>
                    {t('exportAsPDF')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => initiateExport('excel', selectedEmployee === 'all' ? 'daily' : 'all')}>
                    {t('exportAsExcel')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAttendance || isLoadingEmployees ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredAttendanceData.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500">{t('noAttendanceRecords')}</h3>
              <p className="text-gray-400 mt-1">
                {selectedEmployee === 'all' 
                  ? t('noAttendanceThisDate')
                  : t('noAttendanceForEmployee')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedEmployee === 'all' ? (
                      <>
                        <TableHead>{t('employeeId')}</TableHead>
                        <TableHead>{t('name')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('checkIn')}</TableHead>
                        <TableHead>{t('checkOut')}</TableHead>
                        {/* <TableHead>{t('actions')}</TableHead> */}
                      </>
                    ) : (
                      <>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('checkIn')}</TableHead>
                        <TableHead>{t('checkOut')}</TableHead>
                        {/* <TableHead>{t('actions')}</TableHead> */}
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendanceData.map((record: any) => (
                    <TableRow key={record.id}>
                      {selectedEmployee === 'all' ? (
                        <>
                          <TableCell>{record.employee_id}</TableCell>
                          <TableCell>{getEmployeeName(record.employee_id)}</TableCell>
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
                              {record.status}
                            </span>
                          </TableCell>
                          <TableCell>{record.checkinTime || '-'}</TableCell>
                          <TableCell>{record.checkoutTime || '-'}</TableCell>
                          {/* <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => viewEmployeeAttendance(record.employeeId)}
                              className="flex items-center"
                            >
                              <User className="h-4 w-4 mr-1" />
                              {t('details')}
                            </Button>
                          </TableCell> */}
                        </>
                      ) : (
                        <>
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
                              {record.status}
                            </span>
                          </TableCell>
                          <TableCell>{record.checkinTime || '-'}</TableCell>
                          <TableCell>{record.checkoutTime || '-'}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => viewEmployeeAttendance(record.employeeId)}
                              className="flex items-center"
                            >
                              <User className="h-4 w-4 mr-1" />
                              {t('details')}
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={showExportConfirmation}
        onClose={() => setShowExportConfirmation(false)}
        onConfirm={handleExport}
        title={t('confirmExport')}
        description = {t('are you sure you want to export')}
        // description={`${t('confirmExportDescription', {
        //   range: selectedEmployee === 'all' ? t('daily') : t('all'),
        //   format: exportFormat.toUpperCase()
        // })}`}
        // confirmText={`${t('exportAs', { format: exportFormat.toUpperCase() })}`}
        confirmText={`${t('export File')}`}
        cancelText={t('cancel')}
      />
    </div>

  );
};

export default AttendanceReport