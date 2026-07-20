import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = () => {
  const { user } = useAuth();

  if (user) {
    // Redirect based on role
    if (user.roles?.includes('admin')) {
      return <Navigate to='/dashboard/admin' replace />;
    }
    if (user.roles?.includes('blogger')) {
      return <Navigate to='/dashboard/blogger' replace />;
    }
    if (user.roles?.includes('author')) {
      return <Navigate to='/dashboard/author' replace />;
    }
    return <Navigate to='/home' replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
