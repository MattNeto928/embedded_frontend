import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import { SignInForm, SignUpForm } from './components/auth/AuthForms';

// Import pages
import HomePage from './pages/HomePage';
import LabsPage from './pages/LabsPage';
import LabDetailPage from './pages/LabDetailPage';

// Protected route component
interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: ('student' | 'staff')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  allowedRoles = ['student', 'staff'] 
}) => {
  const { authState } = useAuth();
  const { isAuthenticated, user, isLoading } = authState;

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

// Temporary placeholder components for pages
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-12">
    <h1 className="text-3xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">This page is under construction.</p>
  </div>
);

// Create placeholder pages
const CourseMaterialsPage = () => <PlaceholderPage title="Course Materials" />;
const AdminPage = () => <PlaceholderPage title="Admin Dashboard" />;
const NotFoundPage = () => <PlaceholderPage title="404 - Page Not Found" />;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignInForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route 
        path="/course" 
        element={<ProtectedRoute element={<CourseMaterialsPage />} />} 
      />
      <Route 
        path="/labs" 
        element={<ProtectedRoute element={<LabsPage />} />} 
      />
      <Route 
        path="/labs/:labId" 
        element={<ProtectedRoute element={<LabDetailPage />} />} 
      />
      <Route
        path="/admin"
        element={<ProtectedRoute element={<AdminPage />} allowedRoles={['staff']} />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
