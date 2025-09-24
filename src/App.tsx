import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';
import UpdatePassword from '@/pages/UpdatePassword';
import Packages from '@/pages/Packages';
import WhyUs from '@/pages/WhyUs';
import About from '@/pages/About';
import PaymentCallback from '@/pages/PaymentCallback';
import Payment from '@/pages/Payment';
import PaymentSuccess from '@/pages/PaymentSuccess';

import StudentDashboard from '@/pages/StudentDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import PackageManagement from '@/pages/PackageManagement';

// Student Pages
// import StudentDashboardNew from '@/pages/student/Dashboard';
import StudentCalendar from '@/pages/student/Calendar';
import StudentProfile from '@/pages/student/Profile';
import StudentTeachers from '@/pages/student/Teachers';

// Teacher Pages
import TeacherDashboardNew from '@/pages/teacher/Dashboard';
import TeacherProfile from '@/pages/teacher/Profile';
import TeacherSchedule from '@/pages/teacher/Schedule';
import TeacherStudents from '@/pages/teacher/Students';
import TeacherUpload from '@/pages/teacher/Upload';
import TeacherLessons from '@/pages/teacher/Lessons';

// Admin Pages
import AdminDashboardNew from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminAnalytics from '@/pages/admin/Analytics';
import ClassManagement from '@/components/admin/ClassManagement';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="packages" element={<Packages />} />
          <Route path="why-us" element={<WhyUs />} />
          <Route path="about" element={<About />} />

        </Route>

        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/update-password" 
          element={
            <PublicRoute>
              <UpdatePassword />
            </PublicRoute>
          } 
        />
        
        {/* Payment routes */}
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />

        {/* Protected dashboard routes without layout */}
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher-dashboard" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* New Student Routes */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/calendar" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/profile" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/teachers" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentTeachers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/packages" 
          element={
            <ProtectedRoute requiredRole="student">
              <PackageManagement />
            </ProtectedRoute>
          } 
        />

        {/* New Teacher Routes */}
        <Route 
          path="/teacher/dashboard" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboardNew />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/profile" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/schedule" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherSchedule />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/students" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherStudents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/upload" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherUpload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/lessons" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherLessons />
            </ProtectedRoute>
          } 
        />

        {/* New Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardNew />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/classes" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ClassManagement />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
