import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const RoleBasedRoute = ({
  children,
  allowedRoles,
  fallbackPath = '/reader/dashboard',
}) => {
  const { isAuthenticated, loading, hasAnyRole, userRoles } =
    useContext(AuthContext);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (!hasAnyRole(allowedRoles)) {
    // Redirect to appropriate dashboard based on role
    if (userRoles.includes('admin'))
      return <Navigate to='/admin/dashboard' replace />;
    if (userRoles.includes('blogger'))
      return <Navigate to='/blogger/dashboard' replace />;
    if (userRoles.includes('author'))
      return <Navigate to='/author/dashboard' replace />;
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
