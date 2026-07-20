import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import axiosInstance from '../lib/axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const redirectingRef = useRef(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    console.log('Loading from localStorage:', {
      storedUser: !!storedUser,
      token: !!token,
    });

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('Parsed userData roles:', userData.roles);
        setUser(userData);
        setIsAuthenticated(true);
        setUserRoles(userData.roles || []);
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    redirectingRef.current = false;

    try {
      console.log('Attempting login for:', email);
      const response = await axiosInstance.post('/auth.php/login', {
        email,
        password,
      });
      console.log('Login response:', response.data);

      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        console.log('User data from API:', userData);
        console.log('Roles from API:', userData.roles);

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Set state
        setUser(userData);
        setIsAuthenticated(true);
        setUserRoles(userData.roles || []);

        console.log('State updated - userRoles will be:', userData.roles);

        // Return the roles directly so they can be used immediately
        return { success: true, data: userData, roles: userData.roles };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const getDashboardPath = useCallback(
    (roles = null) => {
      // Use provided roles or current state
      const effectiveRoles = roles || userRoles;
      console.log('Getting dashboard path. Roles:', effectiveRoles);

      if (effectiveRoles.includes('admin')) {
        console.log('Admin role detected! Redirecting to /admin/dashboard');
        return '/admin/dashboard';
      }
      if (effectiveRoles.includes('blogger')) {
        console.log('Blogger role detected! Redirecting to /blogger/dashboard');
        return '/blogger/dashboard';
      }
      if (effectiveRoles.includes('author')) {
        console.log('Author role detected! Redirecting to /author/dashboard');
        return '/author/dashboard';
      }
      console.log('No special role detected. Redirecting to /reader/dashboard');
      return '/reader/dashboard';
    },
    [userRoles],
  );

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/auth.php/register', userData);
      if (response.data.success) {
        const userInfo = response.data.data.user;
        const token = response.data.data.token;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userInfo));

        setUser(userInfo);
        setIsAuthenticated(true);
        setUserRoles(userInfo.roles || []);

        return { success: true, data: userInfo, roles: userInfo.roles };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Registration failed. Please try again.',
      };
    }
  };

  const applyForRole = async (role) => {
    try {
      const response = await axiosInstance.put('/users.php/apply-role', {
        role,
      });
      if (response.data.success) {
        const updatedUser = { ...user, roles: response.data.data.roles };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setUserRoles(response.data.data.roles);
        return { success: true, roles: response.data.data.roles };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Apply for role error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to apply for role',
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth.php/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setUserRoles([]);
    }
  };

  const hasRole = useCallback(
    (role) => {
      return userRoles.includes(role);
    },
    [userRoles],
  );

  const hasAnyRole = useCallback(
    (roles) => {
      return roles.some((role) => userRoles.includes(role));
    },
    [userRoles],
  );

  const value = {
    user,
    setUser,
    isAuthenticated,
    loading,
    userRoles,
    login,
    register,
    logout,
    applyForRole,
    getDashboardPath,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
