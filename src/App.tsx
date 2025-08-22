import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import { SignInForm, SignUpForm } from './components/auth/AuthForms';
import { API_ENDPOINT } from './aws-config';

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
        element={<ProtectedRoute element={<LabAccessCheck />} />}
      />
      <Route
        path="/admin"
        element={<ProtectedRoute element={<AdminPage />} allowedRoles={['staff']} />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Component to check if a student can access a lab
const LabAccessCheck: React.FC = () => {
  const { labId } = useParams<{ labId: string }>();
  const { authState } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Only check access for students
    if (authState.user?.role === 'staff') {
      setIsChecking(false);
      return;
    }
    
    const checkLabAccess = async () => {
      try {
        const idToken = localStorage.getItem('idToken');
        if (!idToken) {
          throw new Error('No authentication token found');
        }
        
        // Make a HEAD request to check if the lab is accessible
        const response = await fetch(`${API_ENDPOINT}labs/${labId}`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        if (!response.ok && response.status === 403) {
          // Lab is locked, store error message and redirect
          sessionStorage.setItem('labAccessError',
            'This lab is currently locked. Please wait for your instructor to unlock it.');
          window.location.href = '/labs'; // Force a full redirect
          return;
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking lab access:', error);
        setIsChecking(false);
      }
    };
    
    checkLabAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId, authState.user?.role]);
  
  if (isChecking) {
    return <div className="p-8 text-center">Checking lab access...</div>;
  }
  
  return <LabDetailPage />;
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
