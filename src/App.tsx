import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import SuccessPage from './pages/SuccessPage';
import './styles/animations.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/success" /> : <LandingPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/success" /> : <RegistrationPage />} />
      <Route path="/success" element={
        <ProtectedRoute>
          <SuccessPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="font-sans min-h-screen">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;