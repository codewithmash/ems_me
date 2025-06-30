export type Language = 'en' | 'te' | 'ar';

export const translations = {
  // en: {
  //   companySetup: "Company Setup",
  //   userList: "User List",
  //   attendanceReport: "Attendance Report",
  //   employees: "Employees",
  //   shifts: "Shifts",
  //   locations: "Locations",
  //   projects: "Projects",
  //   masterDataSetup: "Master Data Setup",
  //   changePassword: "Change Password",
  //   logout: "Logout",
  //   dashboard: "Dashboard",
    
  //   // Employee management
  //   addEmployee: "Add Employee",
  //   editEmployee: "Edit Employee",
  //   deleteEmployee: "Delete Employee",
  //   name: "Name",
  //   email: "Email",
  //   phone: "Phone",
  //   employeeId: "Employee ID",
  //   location: "Location",
  //   project: "Project",
    
  //   // Dashboard stats
  //   totalEmployees: "Total Employees",
  //   totalProjects: "Total Projects",
  //   ongoingProjects: "Ongoing Projects",
  //   completedProjects: "Completed Projects",
  //   pendingRegistrations: "Registration Pending",
  //   employeeVerificationStatus: "Employee Verification Status",
  //   biometricVerification: "Biometric Verification",
  //   verified: "Verified",
  //   pending: "Pending",

    
    
  //   // Authentication
  //   loginToAccessDashboard: "Sign in to access the admin dashboard",
  //   login: "Login",
  //   loggingIn: "Logging in...",
  //   password: "Password",
  //   loginSuccessful: "Login Successful",
  //   welcomeBack: "Welcome back to the dashboard",
  //   invalidCredentials: "Invalid email or password",
  //   adminAccessRequired: "Admin access required",
  //   adminAccessRequiredMessage: "You need admin privileges to access this dashboard.",
  //   serverError: "Server error. Please try again later.",
  //   accessDenied: "Access Denied",
  //   loggedInAs: "Logged in as",
  //   defaultCredentials: "Demo credentials",
    
  //   // General
  //   select: "Select",
  //   error: "Error",
  //   errorFetchingDashboardData: "Failed to fetch dashboard data",
  //   status: "Status",
  // },
  en: {
    // Sidebar
    ems: "EMS",
    admin: "Admin",
    companySetup: "Company Setup",
    userList: "User List",
    masterDataSetup: "Master Data Setup",
    changePassword: "Change Password",
    logout: "Logout",
  
    // Company Setup Page
    multipleDeviceAllow: "Allowing multiple devices means can the employee log in from one mobile device or multiple mobile devices? The admin can also reset the registered device from the application login history list.",
    companyName: "Company Name",
    contactNo: "Contact Number",
    companyAdminName: "Company Admin Name",
    adminEmail: "Admin Email",
    adminLoginID: "Admin Login ID",
    multipleDeviceAllowQ: "Allow Multiple Devices?",
    new: "New",
    yes: "Yes",
    no: "No",
    page: "Page",
    of: "of",
    view: "View",
  
    // Attendance Management
    attendanceReport: "Attendance Report",
    filterByDate: "Filter by Date",
    export: "Export",
    print: "Print",
    excel: "Excel",
    csv: "CSV",
    punchIn: "Punch In",
    punchOut: "Punch Out",
  
    // Employee Management
    employees: "Employees",
    addEmployee: "Add Employee",
    updateEmployee: "Update Employee",
    deleteEmployee: "Delete Employee",
    name: "Name",
    email: "Email",
    phone: "Phone",
    project: "Project",
    location: "Location",
    actions: "Actions",
  
    // Shift Management
    shifts: "Shifts",
    addShift: "Add Shift",
    updateShift: "Update Shift",
    deleteShift: "Delete Shift",
    shiftName: "Shift Name",
    startTime: "Start Time",
    endTime: "End Time",
  
    // Leave Management
    leaveManagement: "Leave Management",
    dashboard: "Dashboard",
    notices: "Notices",
    departments: "Departments",
    projects: "Projects",
  
    employeeVerificationStatus: "Employee Verification Status",
    employeeId: "Employee ID",
    biometricVerification: "Biometric Verification",
    verified: "Verified",
    pending: "Pending",
  
    totalEmployees: "Total Employees",
    totalProjects: "Total Projects",
    ongoingProjects: "Ongoing Projects",
    completedProjects: "Completed Projects",
    pendingRegistrations: "Pending Registrations",
  
    leaveRequests: "Leave Requests",
    approved: "Approved",
    rejected: "Rejected",
    noPendingRequests: "No Pending Leave Requests",
    noApprovedRequests: "No Approved Leave Requests",
    noRejectedRequests: "No Rejected Leave Requests",
    submitted: "Submitted",
    leaveType: "Leave Type",
    duration: "Duration",
    reason: "Reason",
    rejectionReason: "Rejection Reason",
    reject: "Reject",
    approve: "Approve",
    LeaveManagement: "Leave Management",
  
    noticeManagement: "Notice Management",
    updateNotice: "Update Notice",
    postNewNotice: "Post New Notice",
    title: "Title",
    enterNoticeTitle: "Enter Notice Title",
    content: "Content",
    enterNoticeContent: "Enter Notice Content",
    cancel: "Cancel",
    postNotice: "Post Notice",
    recentNotices: "Recent Notices",
    noNoticesPostedYet: "No Notices Posted Yet",
    noticesAppearHere: "Posted notices will appear here",
  
    departmentManagement: "Department Management",
    updateDepartment: "Update Department",
    createDepartment: "Create Department",
    departmentName: "Department Name",
    enterDepartmentName: "Enter Department Name",
    description: "Description",
    enterDepartmentDescription: "Enter Department Description",
    departmentBoundary: "Department Boundary",
  
    noDepartmentsFound: "No Departments Found",
    createDepartmentToStart: "Create a department to start",
  
    requiredStaff: "Required Staff",
    unknown: "Unknown",
    notAvailable: "Not Available",
  
    selectUser: "Select User",
    searchUsers: "Search Users...",
    oldPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    changingPassword: "Changing Password",
  
    selectEmployee: "Select Employee",
    searchEmployee: "Search Employee...",
    selectDate: "Select Date",
  
    totalRecords: "Total Records",
    present: "Present",
    absent: "Absent",
    late: "Late",
    dailyAttendance: "Daily Attendance",
    today: "Today",
    employeeAttendance: "Employee Attendance",
    exportReport: "Export Report",
    exportAsPDF: "Export as PDF",
    exportAsExcel: "Export as Excel",
    noAttendanceRecords: "No Attendance Records",
    noAttendanceThisDate: "No Attendance Recorded for This Date",
    noAttendanceForEmployee: "No Attendance Records for This Employee",
  
    employeeManagementSystem: "Employee Management System",
    streamlineWorkforceManagement: "Streamline your workforce management with our comprehensive solution",
    completeEmployeeData: "Complete Employee Data Management",
    performanceTracking: "Performance Tracking and Analytics",
    secureControls: "Secure Admin Controls",
    intuitiveUI: "Intuitive User Interface",
    welcomeBack: "Welcome Back",
    signInToDashboard: "Sign in to access your dashboard",
    invalidCredentials: "Invalid Credentials",
    serverError: "Server error occurred, please try again later",
    adminAccessRequired: "Admin Access Required",
  
    password: "Password",
    forgotPassword: "Reset Password?",
    rememberMe: "Remember Me",
    loggingIn: "Logging in...",
    login: "Login",
    secureLogin: "Secure login. Your data is protected",
    allRightsReserved: "All Rights Reserved",
    createProject: "Create Project",
    status: "Status",
    checkIn: "Check In",
    checkOut: "Check Out",
  
    date: "Date",
    details: "Details",
    confirmExport: "Confirm Export",
    confirmExportDescription: "Are you sure you want to export attendance records for {{range}} as {{format}}?",
    exportAs: "Export as {{format}}",
  
    all: "All",
    daily: "Daily",
  
    // Location Management
    locations: "Locations",
    addLocation: "Add Location",
    updateLocation: "Update Location",
    deleteLocation: "Delete Location",
    locationName: "Location Name",
    latitude: "Latitude",
    longitude: "Longitude",
    radius: "Radius (in meters)",
  
    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    submit: "Submit",
    reset: "Reset",
    otpSent: "OTP sent",
  checkYourEmail: "Please check your email for the verification code.",
  otp: "One-Time Password",
  otpSendFailed: "Failed to send OTP. Please try again.",
  invalidOtpOrLogin: "Invalid OTP or login failed.",
  sendOtp: "Send OTP",
  verifyOtpAndLogin: "Verify OTP and Login",
  verifying: "Verifying...",
  sendingOtp: "Sending OTP...",



    dailyReportTitle: "Daily Attendance Report - {{date}}",
      dailyReportSubtitle: "Showing all employees for {{date}}",
      employeeReportTitle: "Employee Attendance Report - {{name}}",
      employeeReportSubtitle: "Showing all attendance records for {{name}}",
      generated: "Generated: {{datetime}}",
      summary: "Attendance Summary",
      total: "Total Records: {{count}}",
      headersAll: ["Employee ID", "Name", "Status", "Check In", "Check Out"],
      headersSingle: ["Date", "Status", "Check In", "Check Out"]
  },
  
  
  
  te: {
    // Sidebar
    companySetup: "కంపెనీ సెటప్",
    userList: "వినియోగదారుల జాబితా",
    masterDataSetup: "మాస్టర్ డేటా సెటప్",
    changePassword: "పాస్‌వర్డ్‌ని మార్చండి",
    logout: "లాగ్అవుట్",
    
    // Company Setup Page
    multipleDeviceAllow: "బహుళ పరికరం అనుమతిస్తుంది అంటే, ఒక ఉద్యోగి ఒక మొబైల్ నుండి లేదా కొన్ని మొబైల్స్ నుండి లాగిన్ చేయగలడా? అలాగే అడ్మిన్ యాప్ లాగిన్ హిస్టరీ మెను నుండి ఉద్యోగి నమోదు చేసిన పరికరాన్ని రీసెట్ చేయవచ్చు",
    companyName: "కంపెనీ పేరు",
    contactNo: "కాంటాక్ట్ నంబర్",
    companyAdminName: "కంపెనీ అడ్మిన్ పేరు",
    adminEmail: "అడ్మిన్ ఇమెయిల్",
    adminLoginID: "అడ్మిన్ లాగిన్ ID",
    multipleDeviceAllowQ: "బహుళ పరికరం అనుమతించాలా?",
    new: "కొత్త",
    yes: "అవును",
    no: "కాదు",
    page: "పేజీ",
    of: "యొక్క",
    view: "వీక్షించు",
    
    // Attendance Management
    attendanceReport: "హాజరు నివేదిక",
    filterByDate: "తేదీ ద్వ���రా ఫిల్టర్ చేయండి",
    export: "ఎగుమతి",
    print: "ముద్రించు",
    excel: "ఎక్సెల్",
    csv: "CSV",
    punchIn: "పంచ్ ఇన్",
    punchOut: "పంచ్ అవుట్",
    
    // Employee Management
    employees: "ఉద్యోగులు",
    addEmployee: "ఉద్యోగిని జోడించండి",
    updateEmployee: "ఉద్యోగిని అప్‌డేట్ చేయండి",
    deleteEmployee: "ఉద్యోగిని తొలగించండి",
    name: "పేరు",
    email: "ఇమెయిల్",
    phone: "ఫోన్",
    project: "ప్రాజెక్ట్",
    location: "స్థానం",
    actions: "చర్యలు",
    
    // Shift Management
    shifts: "షిఫ్టులు",
    addShift: "షిఫ్ట్ జోడించండి",
    updateShift: "షిఫ్ట్ అప్‌డేట్ చేయండి",
    deleteShift: "షిఫ్ట్ తొలగించండి",
    shiftName: "షిఫ్ట్ పేరు",
    startTime: "ప్రారంభ సమయం",
    endTime: "ముగింపు సమయం",
    
    // Location Management
    locations: "స్థానాలు",
    addLocation: "స్థానాన్ని జోడించండి",
    updateLocation: "స్థానాన్ని అప్‌డేట్ చేయండి",
    deleteLocation: "స్థానాన్ని తొలగించండి",
    locationName: "స్థానం పేరు",
    latitude: "అక్షాంశం",
    longitude: "రేఖాంశం",
    radius: "వ్యాసార్ధం (మీటర్లలో)",
    
    // Common
    save: "సేవ్",
    cancel: "రద్దు",
    edit: "సవరించు",
    delete: "తొలగించు",
    search: "శోధన",
    submit: "సమర్పించండి",
    reset: "రీసెట్"
  },
  ar: {
    // Sidebar
     ems: "نظام إدارة الطوارئ",
     admin: "المسؤول",
    companySetup: "إعداد الشركة",
    userList: "قائمة المستخدمين",
    masterDataSetup: "إعداد البيانات الرئيسية",
    changePassword: "تغيير كلمة المرور",
    logout: "تسجيل الخروج",
    
    // Company Setup Page
    multipleDeviceAllow: "يسمح بأجهزة متعددة يعني، هل يمكن للموظف تسجيل الدخول من جهاز محمول واحد أو من عدة أجهزة محمولة؟ يمكن للمسؤول أيضًا إعادة تعيين جهاز الموظف المسجل من قائمة سجل تسجيل الدخول للتطبيق",
    companyName: "اسم الشركة",
    contactNo: "رقم الاتصال",
    companyAdminName: "اسم مسؤول الشركة",
    adminEmail: "البريد الإلكتروني للمسؤول",
    adminLoginID: "معرف تسجيل دخول المسؤول",
    multipleDeviceAllowQ: "السماح بأجهزة متعددة؟",
    new: "جديد",
    yes: "نعم",
    no: "لا",
    page: "صفحة",
    of: "من",
    view: "عرض",
    
    // Attendance Management
    attendanceReport: "تقرير الحضور",
    filterByDate: "تصفية حسب التاريخ",
    export: "تصدير",
    print: "طباعة",
    excel: "إكسل",
    csv: "CSV",
    punchIn: "تسجيل الدخول",
    punchOut: "تسجيل الخروج",
    


    // Employee Management
    employees: "الموظفين",
    addEmployee: "إضافة موظف",
    updateEmployee: "تحديث الموظف",
    deleteEmployee: "حذف الموظف",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    project: "المشروع",
    location: "الموقع",
    actions: "الإجراءات",
    
    // Shift Management
    shifts: "المناوبات",
    addShift: "إضافة مناوبة",
    updateShift: "تحديث المناوبة",
    deleteShift: "حذف المناوبة",
    shiftName: "اسم المناوبة",
    startTime: "وقت البدء",
    endTime: "وقت الانتهاء",


    //Leave Management

    leaveManagement: "إدارة الإجازات",
    dashboard: "لوحة التحكم",
    notices: "إشعار",
    departments: "الأقسام",
    projects:"المشاريع",

    employeeVerificationStatus: "حالة التحقق من الموظف",
    employeeId: "معرّف الموظف",
    biometricVerification: "التحقق البيومتري",
    verified: "تم التحقق",
    pending: "قيد الانتظار",

    totalEmployees: "إجمالي الموظفين",
    totalProjects: "إجمالي المشاريع",
    ongoingProjects: "المشاريع الجارية",
    completedProjects: "المشاريع المكتملة",
    pendingRegistrations: "التسجيلات المعلقة",


    leaveRequests: "طلبات الإجازة",
    approved: "تمت الموافقة",
    rejected: "مرفوضة",
    noPendingRequests: "لا توجد طلبات إجازة قيد الانتظار",
    noApprovedRequests: "لا توجد طلبات إجازة تمت الموافقة عليها",
    noRejectedRequests: "لا توجد طلبات إجازة مرفوضة",
    submitted: "تم الإرسال",
    leaveType: "نوع الإجازة",
    duration: "المدة",
    reason: "السبب",
    rejectionReason: "سبب الرفض",
    reject: "رفض",
    approve: "موافقة",
    LeaveManagement:"إدارة الإجازة",

    noticeManagement: "إدارة الإشعارات",
  updateNotice: "تحديث الإشعار",
  postNewNotice: "نشر إشعار جديد",
  title: "العنوان",
  enterNoticeTitle: "أدخل عنوان الإشعار",
  content: "المحتوى",
  enterNoticeContent: "أدخل محتوى الإشعار",
  cancel: "إلغاء",
  postNotice: "نشر الإشعار",
  recentNotices: "الإشعارات الحديثة",
  noNoticesPostedYet: "لم يتم نشر أي إشعارات حتى الآن",
  noticesAppearHere: "ستظهر الإشعارات التي تنشرها هنا",


  departmentManagement: "إدارة الأقسام",
  updateDepartment: "تحديث القسم",
  createDepartment: "إنشاء قسم",
  departmentName: "اسم القسم",
  enterDepartmentName: "أدخل اسم القسم",
  description: "الوصف",
  enterDepartmentDescription: "أدخل وصف القسم",
  departmentBoundary: "حدود القسم",
  
  noDepartmentsFound: "لم يتم العثور على أقسام",
  createDepartmentToStart: "قم بإنشاء قسم للبدء",
  
  requiredStaff: "عدد الموظفين المطلوب",
  unknown: "غير معروف",
  notAvailable: "غير متوفر",

  
  selectUser: "اختر المستخدم",
  searchUsers: "ابحث عن المستخدمين...",
  oldPassword: "كلمة المرور الحالية",
  newPassword: "كلمة المرور الجديدة",
  confirmNewPassword: "تأكيد كلمة المرور الجديدة",
  changingPassword: "جارٍ تغيير كلمة المرور",


  
  selectEmployee: "اختر الموظف",
  searchEmployee: "ابحث عن موظف...",
  selectDate: "اختر التاريخ",
  
  totalRecords: "إجمالي السجلات",
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  dailyAttendance: "الحضور اليومي",
  today: "اليوم",
  employeeAttendance: "حضور الموظف",
  exportReport: "تصدير التقرير",
  exportAsPDF: "تصدير كـ PDF",
  exportAsExcel: "تصدير كـ Excel",
  noAttendanceRecords: "لا توجد سجلات حضور",
  noAttendanceThisDate: "لا يوجد حضور مسجل لهذا التاريخ",
  noAttendanceForEmployee: "لا توجد سجلات حضور لهذا الموظف",


  employeeManagementSystem: "نظام إدارة الموظفين",
  streamlineWorkforceManagement: "قم بتبسيط إدارة القوى العاملة لديك من خلال حلنا الشامل",
  completeEmployeeData: "إدارة كاملة لبيانات الموظفين",
  performanceTracking: "تتبع الأداء والتحليلات",
  secureControls: "ضوابط إدارية آمنة",
  intuitiveUI: "واجهة مستخدم بديهية",
  welcomeBack: "مرحباً بعودتك",
  signInToDashboard: "سجّل الدخول للوصول إلى لوحة التحكم الخاصة بك",
  invalidCredentials: "بيانات الاعتماد غير صحيحة",
  serverError: "حدث خطأ في الخادم، حاول مرة أخرى لاحقًا",
  adminAccessRequired: "يتطلب الوصول كمسؤول",
  
  password: "كلمة المرور",
  forgotPassword: "هل نسيت كلمة المرور؟",
  rememberMe: "تذكرني",
  loggingIn: "جاري تسجيل الدخول...",
  login: "تسجيل الدخول",
  secureLogin: "تسجيل دخول آمن. بياناتك محمية",
  allRightsReserved: "جميع الحقوق محفوظة",
  createProject:"إنشاء مشروع",
  status: "الحالة",
  checkIn: "تسجيل الدخول",
  checkOut: "تسجيل الخروج",
  
  date: "التاريخ",
  details: "تفاصيل",
  confirmExport: "تأكيد التصدير",
  confirmExportDescription: "هل أنت متأكد أنك تريد تصدير سجلات الحضور لـ {{range}} كـ {{format}}؟",
  exportAs: "تصدير كـ {{format}}",
  
  all: "الكل",
  daily: "اليومي",

  otpSent: "تم إرسال رمز التحقق",
  checkYourEmail: "يرجى التحقق من بريدك الإلكتروني للحصول على رمز التحقق.",
  otp: "رمز التحقق لمرة واحدة",
  otpSendFailed: "فشل في إرسال رمز التحقق. حاول مرة أخرى.",
  invalidOtpOrLogin: "رمز التحقق غير صالح أو فشل تسجيل الدخول.",
  sendOtp: "إرسال رمز التحقق",
  verifyOtpAndLogin: "تحقق من الرمز وتسجيل الدخول",
  verifying: "جاري التحقق...",
  sendingOtp: "جاري إرسال الرمز...",





    
    // Location Management
    locations: "المواقع",
    addLocation: "إضافة موقع",
    updateLocation: "تحديث الموقع",
    deleteLocation: "حذف الموقع",
    locationName: "اسم الموقع",
    latitude: "خط العرض",
    longitude: "خط الطول",
    radius: "نصف القطر (بالأمتار)",
    
    // Common
    save: "حفظ",
    // cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    search: "بحث",
    submit: "إرسال",
    reset: "إعادة تعيين",


    department: "القسم",
    role: "الدور",
    shift: "الوردية",
    selectDepartment: "اختر القسم",
    selectionShift: "اختر الوردية",
    locationArea: "منطقة الموقع",



    dailyReportTitle: "تقرير الحضور اليومي - {{date}}",
      dailyReportSubtitle: "عرض جميع الموظفين لـ {{date}}",
      employeeReportTitle: "تقرير حضور الموظف - {{name}}",
      employeeReportSubtitle: "عرض جميع سجلات الحضور لـ {{name}}",
      generated: "تم التوليد: {{datetime}}",
      summary: "ملخص الحضور",
      total: "إجمالي السجلات: {{count}}",
      headersAll: ["معرّف الموظف", "الاسم", "الحالة", "تسجيل الدخول", "تسجيل الخروج"],
      headersSingle: ["التاريخ", "الحالة", "تسجيل الدخول", "تسجيل الخروج"]


  }
};
