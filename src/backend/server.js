
import express from 'express';
import cors from 'cors';
import { testConnection } from './config/db.js';
import companyRoutes from './routes/companyRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import employeeService from './services/employeeService.js';

import projectRoutes from './routes/projectRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import designationRoutes from './routes/designationRoutes.js';
import emailRoutes from './routes/emailRoutes.js'

import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



employeeService.createDefaultEmployee()
  .then(result => {
    if (result.success) {
      console.log('Default employee setup:', result.message);
    } else {
      console.error('Default employee setup failed:', result.error);
    }
  });


// Test database connection
testConnection().then((connected) => {
  if (connected) {
    console.log('Connected to database');
  } else {
    console.error('Failed to connect to database');
  }
});


 // Routes
app.use('/api/companies', companyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/email',emailRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// app.use(express.static('public'));

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Endpoint to download the Arabic PDF
// app.get('/api/download-arabic-pdf', async (req, res) => {
//   try {
//     const browser = await puppeteer.launch({ 
//       headless: 'new',
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
    
//     const filePath = path.join(__dirname, 'public', 'template.html');
//     const html = fs.readFileSync(filePath, 'utf-8');
//     await page.setContent(html, { waitUntil: 'networkidle0' });
    
//     // Wait for fonts to load using page.waitForFunction
//     await page.waitForFunction(() => {
//       return document.fonts.ready;
//     });
    
//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       margin: {
//         top: '20px',
//         right: '20px',
//         bottom: '20px',
//         left: '20px'
//       }
//     });
    
//     await browser.close();
    
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Length', pdfBuffer.length);
//     res.setHeader('Content-Disposition', 'attachment; filename="arabic-report.pdf"');
//     res.setHeader('Cache-Control', 'no-cache');
    
//     res.end(pdfBuffer);
    
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).json({ error: 'Failed to generate PDF' });
//   }
// });


// app.post('/api/download-arabic-pdf', async (req, res) => {
//   try {
//     const { 
//       selectedEmployee, 
//       selectedDate, 
//       filteredAttendanceData, 
//       stats, 
//       employees,
//       language
//     } = req.body;

//     console.log("req.body",req.body)

//     // Helper function to get employee name
//     const getEmployeeName = (employeeId) => {
//       const employee = employees.find(emp => emp.employee_id === employeeId);
//       return employee ? employee.name : employeeId;
//     };

//     // Format date helper
//     const formatDate = (date) => {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     };

//     const formatDateTime = (date) => {
//       return new Date(date).toLocaleString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     };

//     // Determine title and subtitle
//     let title, subtitle;
//     if (selectedEmployee === 'all') {
//       title = `Daily Attendance Report - ${formatDate(selectedDate || new Date())}`;
//       subtitle = `Showing all employees for ${formatDate(selectedDate || new Date())}`;
//     } else {
//       const employeeName = getEmployeeName(selectedEmployee);
//       title = `Employee Attendance Report - ${employeeName}`;
//       subtitle = `Showing all attendance records for ${employeeName}`;
//     }

//     // Generate HTML content dynamically
//     const htmlContent = `
//     <!DOCTYPE html>
//     <html dir="rtl" lang="ar">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Attendance Report</title>
//         <style>
//             @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;600;700&display=swap');
            
//             * {
//                 margin: 0;
//                 padding: 0;
//                 box-sizing: border-box;
//             }
            
//             body {
//                 font-family: 'Noto Sans Arabic', Arial, sans-serif;
//                 line-height: 1.6;
//                 color: #333;
//                 background: #fff;
//                 padding: 20px;
//             }
            
//             .header {
//                 text-align: center;
//                 margin-bottom: 30px;
//                 border-bottom: 2px solid #007bff;
//                 padding-bottom: 20px;
//             }
            
//             .title {
//                 font-size: 24px;
//                 font-weight: 700;
//                 color: #007bff;
//                 margin-bottom: 10px;
//             }
            
//             .subtitle {
//                 font-size: 16px;
//                 color: #666;
//                 margin-bottom: 5px;
//             }
            
//             .generated-date {
//                 font-size: 12px;
//                 color: #888;
//             }
            
//             .stats-section {
//                 margin-bottom: 30px;
//                 background: #f8f9fa;
//                 padding: 20px;
//                 border-radius: 8px;
//                 border: 1px solid #dee2e6;
//             }
            
//             .stats-title {
//                 font-size: 18px;
//                 font-weight: 600;
//                 margin-bottom: 15px;
//                 color: #495057;
//             }
            
//             .stats-grid {
//                 display: grid;
//                 grid-template-columns: repeat(2, 1fr);
//                 gap: 10px;
//             }
            
//             .stat-item {
//                 font-size: 14px;
//                 padding: 8px;
//                 background: white;
//                 border-radius: 4px;
//                 border: 1px solid #e9ecef;
//             }
            
//             .table-container {
//                 overflow-x: auto;
//             }
            
//             table {
//                 width: 100%;
//                 border-collapse: collapse;
//                 margin-top: 20px;
//                 font-size: 12px;
//             }
            
//             th, td {
//                 border: 1px solid #dee2e6;
//                 padding: 10px;
//                 text-align: center;
//             }
            
//             th {
//                 background-color: #007bff;
//                 color: white;
//                 font-weight: 600;
//             }
            
//             tr:nth-child(even) {
//                 background-color: #f8f9fa;
//             }
            
//             tr:hover {
//                 background-color: #e3f2fd;
//             }
            
//             .status-present {
//                 color: #28a745;
//                 font-weight: 600;
//             }
            
//             .status-absent {
//                 color: #dc3545;
//                 font-weight: 600;
//             }
            
//             .status-late {
//                 color: #ffc107;
//                 font-weight: 600;
//             }
            
//             @media print {
//                 body {
//                     padding: 0;
//                 }
                
//                 .stats-grid {
//                     grid-template-columns: repeat(4, 1fr);
//                 }
//             }
//         </style>
//     </head>
//     <body>
//         <div class="header">
//             <h1 class="title">${title}</h1>
//             <p class="subtitle">${subtitle}</p>
//             <p class="generated-date">Generated: ${formatDateTime(new Date())}</p>
//         </div>
        
//         <div class="stats-section">
//             <h2 class="stats-title">Attendance Summary</h2>
//             <div class="stats-grid">
//                 <div class="stat-item"><strong>Total Records:</strong> ${stats.total}</div>
//                 <div class="stat-item"><strong>Present:</strong> ${stats.present} (${Math.round((stats.present / stats.total) * 100) || 0}%)</div>
//                 <div class="stat-item"><strong>Absent:</strong> ${stats.absent} (${Math.round((stats.absent / stats.total) * 100) || 0}%)</div>
//                 <div class="stat-item"><strong>Late:</strong> ${stats.late} (${Math.round((stats.late / stats.total) * 100) || 0}%)</div>
//             </div>
//         </div>
        
//         <div class="table-container">
//             <table>
//                 <thead>
//                     <tr>
//                         ${selectedEmployee === 'all' 
//                           ? '<th>Employee ID</th><th>Name</th><th>Status</th><th>Check In</th><th>Check Out</th>'
//                           : '<th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th>'
//                         }
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${filteredAttendanceData.map(record => {
//                       const statusClass = `status-${record.status.toLowerCase()}`;
//                       if (selectedEmployee === 'all') {
//                         return `
//                           <tr>
//                             <td>${record.employeeId}</td>
//                             <td>${getEmployeeName(record.employeeId)}</td>
//                             <td class="${statusClass}">${record.status}</td>
//                             <td>${record.checkinTime || '-'}</td>
//                             <td>${record.checkoutTime || '-'}</td>
//                           </tr>
//                         `;
//                       } else {
//                         return `
//                           <tr>
//                             <td>${formatDate(new Date(record.date))}</td>
//                             <td class="${statusClass}">${record.status}</td>
//                             <td>${record.checkinTime || '-'}</td>
//                             <td>${record.checkoutTime || '-'}</td>
//                           </tr>
//                         `;
//                       }
//                     }).join('')}
//                 </tbody>
//             </table>
//         </div>
//     </body>
//     </html>
//     `;

//     const browser = await puppeteer.launch({ 
//       headless: 'new',
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
    
//     await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
//     // Wait for fonts to load
//     await page.waitForFunction(() => {
//       return document.fonts.ready;
//     });
    
//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       margin: {
//         top: '20px',
//         right: '20px',
//         bottom: '20px',
//         left: '20px'
//       }
//     });
    
//     await browser.close();
    
//     // Generate filename similar to your jsPDF approach
//     const formattedDate = selectedDate ? 
//       new Date(selectedDate).toISOString().split('T')[0] : 
//       new Date().toISOString().split('T')[0];
    
//     const fileName = selectedEmployee === 'all'
//       ? `daily-attendance-report-${formattedDate}.pdf`
//       : `employee-attendance-${selectedEmployee}.pdf`;
    
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Length', pdfBuffer.length);
//     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//     res.setHeader('Cache-Control', 'no-cache');
    
//     res.end(pdfBuffer);
    
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).json({ error: 'Failed to generate PDF' });
//   }
// });



app.post('/api/download-arabic-pdf', async (req, res) => {
  try {
    const {
      selectedEmployee,
      selectedDate,
      filteredAttendanceData,
      stats,
      employeeData,
      language
    } = req.body;

    // console.log("req.body", req.body);

    const isArabic = language === 'ar';
    const t = (en, ar) => (isArabic ? ar : en);

    const getEmployeeName = (employeeId) => {
      const employee = employeeData.find(emp => emp.employee_id === employeeId);
      return employee ? employee.name : employeeId;
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    let title, subtitle;
    if (selectedEmployee === 'all') {
      title = t(
        `Daily Attendance Report - ${formatDate(selectedDate || new Date())}`,
        `تقرير الحضور اليومي - ${formatDate(selectedDate || new Date())}`
      );
      subtitle = t(
        `Showing all employees for ${formatDate(selectedDate || new Date())}`,
        `عرض جميع الموظفين لـ ${formatDate(selectedDate || new Date())}`
      );
    } else {
      const employeeName = getEmployeeName(selectedEmployee);
      title = t(
        `Employee Attendance Report - ${employeeName}`,
        `تقرير حضور الموظف - ${employeeName}`
      );
      subtitle = t(
        `Showing all attendance records for ${employeeName}`,
        `عرض جميع سجلات الحضور لـ ${employeeName}`
      );
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html ${isArabic ? 'dir="rtl" lang="ar"' : ''}>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attendance Report</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: '${isArabic ? "Noto Sans Arabic" : "Arial"}', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
                padding: 20px;
            }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: 700; color: #007bff; margin-bottom: 10px; }
            .subtitle { font-size: 16px; color: #666; margin-bottom: 5px; }
            .generated-date { font-size: 12px; color: #888; }
            .stats-section { margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
            .stats-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #495057; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .stat-item { font-size: 14px; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e9ecef; }
            .table-container { overflow-x: auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #dee2e6; padding: 10px; text-align: center; }
            th { background-color: #007bff; color: white; font-weight: 600; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            tr:hover { background-color: #e3f2fd; }
            .status-present { color: #28a745; font-weight: 600; }
            .status-absent { color: #dc3545; font-weight: 600; }
            .status-late { color: #ffc107; font-weight: 600; }
            @media print { body { padding: 0; } .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1 class="title">${title}</h1>
            <p class="subtitle">${subtitle}</p>
            <p class="generated-date">${t('Generated', 'تم الإنشاء')}: ${formatDateTime(new Date())}</p>
        </div>

        <div class="stats-section">
            <h2 class="stats-title">${t("Attendance Summary", "ملخص الحضور")}</h2>
            <div class="stats-grid">
                <div class="stat-item"><strong>${t("Total Records", "إجمالي السجلات")}:</strong> ${stats.total}</div>
                <div class="stat-item"><strong>${t("Present", "حاضر")}:</strong> ${stats.present} (${Math.round((stats.present / stats.total) * 100) || 0}%)</div>
                <div class="stat-item"><strong>${t("Absent", "غائب")}:</strong> ${stats.absent} (${Math.round((stats.absent / stats.total) * 100) || 0}%)</div>
                <div class="stat-item"><strong>${t("Late", "متأخر")}:</strong> ${stats.late} (${Math.round((stats.late / stats.total) * 100) || 0}%)</div>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        ${selectedEmployee === 'all' 
                          ? `<th>${t("Employee ID", "معرّف الموظف")}</th><th>${t("Name", "الاسم")}</th><th>${t("Status", "الحالة")}</th><th>${t("Check In", "تسجيل الدخول")}</th><th>${t("Check Out", "تسجيل الخروج")}</th>`
                          : `<th>${t("Date", "التاريخ")}</th><th>${t("Status", "الحالة")}</th><th>${t("Check In", "تسجيل الدخول")}</th><th>${t("Check Out", "تسجيل الخروج")}</th>`
                        }
                    </tr>
                </thead>
                <tbody>
                    ${filteredAttendanceData.map(record => {
                      const statusClass = `status-${record.status.toLowerCase()}`;
                      const statusLabel = isArabic ?
                        (record.status === 'Present' ? 'حاضر' : record.status === 'Absent' ? 'غائب' : 'متأخر') :
                        record.status;
                      if (selectedEmployee === 'all') {
                        return `
                          <tr>
                            <td>${record.employeeId}</td>
                            <td>${getEmployeeName(record.employeeId)}</td>
                            <td class="${statusClass}">${statusLabel}</td>
                            <td>${record.checkinTime || '-'}</td>
                            <td>${record.checkoutTime || '-'}</td>
                          </tr>
                        `;
                      } else {
                        return `
                          <tr>
                            <td>${formatDate(new Date(record.date))}</td>
                            <td class="${statusClass}">${statusLabel}</td>
                            <td>${record.checkinTime || '-'}</td>
                            <td>${record.checkoutTime || '-'}</td>
                          </tr>
                        `;
                      }
                    }).join('')}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    await browser.close();

    const formattedDate = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const fileName = selectedEmployee === 'all'
      ? `daily-attendance-report-${formattedDate}.pdf`
      : `employee-attendance-${selectedEmployee}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    res.end(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});






export default app;

