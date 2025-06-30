import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import db from "./utils/db";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CompanySetup from "./pages/CompanySetup";
import AttendanceReport from "./pages/AttendanceReport";
import Employees from "./pages/Employees";
import ShiftManagement from "./pages/ShiftManagement";
import LocationManagement from "./pages/LocationManagement";
import ProjectManagement from "./pages/ProjectManagement";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import NoticeManagement from "./pages/NoticeManagement";
import LeaveManagement from "./pages/LeaveManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import DesignationManagement from "./pages/DesignationManagement";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import ChangePassword from "./pages/ChangePassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.initDbSchema();
        //console.log("Database schema initialized");
      } catch (error) {
        console.error("Failed to initialize database schema:", error);
      }
    };

    initDatabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Super Admin Routes */}
                {/* <Route 
                  path="/company-setup" 
                  element={
                    <ProtectedRoute requireSuperAdmin>
                      <Layout><CompanySetup /></Layout>
                    </ProtectedRoute>
                  } 
                /> */}
                <Route 
                  path="/user-list" 
                  element={
                    <ProtectedRoute requireSuperAdmin>
                      <Layout><Employees /></Layout>
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employees" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><Employees /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><ProjectManagement /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/notices" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><NoticeManagement /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/leaves" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><LeaveManagement /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shifts" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><ShiftManagement /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/attendance-report" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><AttendanceReport /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/departments" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><DepartmentManagement /></Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Shared Routes */}
                <Route 
                  path="/change-password" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Layout><ChangePassword /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/logout" 
                  element={<Navigate to="/" />} 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
