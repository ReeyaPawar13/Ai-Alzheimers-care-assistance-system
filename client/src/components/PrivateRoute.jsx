import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // redirect to correct dashboard or landing based on role
    switch (user.role) {
      case 'patient':
        return <Navigate to="/patient/dashboard" replace />;
      // Add caregiver and doctor redirects later
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
