import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LearningPage from './pages/LearningPage';
import MyCoursesPage from './pages/MyCoursesPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import ManageCourses from './pages/instructor/ManageCourses';
import ManageLectures from './pages/instructor/ManageLectures';
import ManageStudents from './pages/instructor/ManageStudents';
import ManagePayments from './pages/instructor/ManagePayments';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApproveCourses from './pages/admin/ApproveCourses';
import Revenue from './pages/admin/Revenue';
import UserManagement from './pages/admin/UserManagement';
import './index.css';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/courses" element={<><Navbar /><CoursesPage /><Footer /></>} />
      <Route path="/courses/:id" element={<><Navbar /><CourseDetailPage /><Footer /></>} />
      
      {/* Protected Student Routes */}
      <Route path="/my-courses" element={
        <ProtectedRoute><Navbar /><MyCoursesPage /><Footer /></ProtectedRoute>
      } />
      <Route path="/learn/:courseId" element={
        <ProtectedRoute><Navbar /><LearningPage /></ProtectedRoute>
      } />
      <Route path="/payment/:courseId" element={
        <ProtectedRoute><Navbar /><PaymentPage /><Footer /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Navbar /><ProfilePage /><Footer /></ProtectedRoute>
      } />
      <Route path="/change-password" element={
        <ProtectedRoute><Navbar /><ChangePasswordPage /><Footer /></ProtectedRoute>
      } />

      {/* Instructor Routes */}
      <Route path="/instructor" element={
        <ProtectedRoute roles={['instructor', 'admin']}><Navbar /><InstructorDashboard /><Footer /></ProtectedRoute>
      } />
      <Route path="/instructor/courses" element={
        <ProtectedRoute roles={['instructor', 'admin']}><Navbar /><ManageCourses /><Footer /></ProtectedRoute>
      } />
      <Route path="/instructor/courses/:courseId/lectures" element={
        <ProtectedRoute roles={['instructor', 'admin']}><Navbar /><ManageLectures /><Footer /></ProtectedRoute>
      } />
      <Route path="/instructor/courses/:courseId/students" element={
        <ProtectedRoute roles={['instructor', 'admin']}><Navbar /><ManageStudents /><Footer /></ProtectedRoute>
      } />
      <Route path="/instructor/payments" element={
        <ProtectedRoute roles={['instructor', 'admin']}><Navbar /><ManagePayments /><Footer /></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><Navbar /><AdminDashboard /><Footer /></ProtectedRoute>
      } />
      <Route path="/admin/courses" element={
        <ProtectedRoute roles={['admin']}><Navbar /><ApproveCourses /><Footer /></ProtectedRoute>
      } />
      <Route path="/admin/revenue" element={
        <ProtectedRoute roles={['admin']}><Navbar /><Revenue /><Footer /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}><Navbar /><UserManagement /><Footer /></ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
