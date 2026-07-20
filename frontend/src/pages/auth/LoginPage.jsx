import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const getDashboardPathFromRoles = (roles) => {
    console.log('Getting dashboard path from roles:', roles);

    if (roles.includes('admin')) {
      return '/admin/dashboard';
    }
    if (roles.includes('blogger')) {
      return '/blogger/dashboard';
    }
    if (roles.includes('author')) {
      return '/author/dashboard';
    }
    return '/reader/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      console.log('Login result:', result);

      if (result.success) {
        showNotification('Login successful! Welcome back!', 'success');

        // Use the roles from the result directly (not from state)
        const dashboardPath = getDashboardPathFromRoles(result.roles);
        console.log('Redirecting to:', dashboardPath);

        // Small delay to ensure everything is ready
        setTimeout(() => {
          navigate(dashboardPath);
        }, 100);
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-navy via-royal-blue to-indigo py-12 px-4 sm:px-6 lg:px-8'>
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 right-10 w-96 h-96 bg-emerald rounded-full blur-3xl'></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 relative z-10'
      >
        <div className='text-center'>
          <div className='w-16 h-16 gradient-bg-main rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-white text-2xl font-bold'>B</span>
          </div>
          <h2 className='text-3xl font-bold text-dark-text dark:text-white'>
            Welcome Back
          </h2>
          <p className='mt-2 text-dark-text/60 dark:text-gray-400'>
            Sign in to your BlogLib account
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-dark-text dark:text-gray-300 mb-2'
              >
                Email Address
              </label>
              <div className='relative'>
                <FiMail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-royal-blue focus:outline-none transition-colors'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-dark-text dark:text-gray-300 mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <FiLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full pl-10 pr-12 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-royal-blue focus:outline-none transition-colors'
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-royal-blue transition-colors'
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 text-royal-blue focus:ring-royal-blue border-soft-gray rounded'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-sm text-dark-text/70 dark:text-gray-400'
              >
                Remember me
              </label>
            </div>

            <Link
              to='/forgot-password'
              className='text-sm text-royal-blue hover:text-indigo transition-colors'
            >
              Forgot password?
            </Link>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            ) : (
              <>
                Sign In <FiLogIn className='ml-2' />
              </>
            )}
          </button>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-soft-gray dark:border-gray-700'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white dark:bg-gray-800 text-dark-text/50'>
                Or continue with
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <button
              type='button'
              className='flex justify-center items-center py-3 px-4 border border-soft-gray dark:border-gray-700 rounded-lg hover:bg-soft-gray dark:hover:bg-gray-700 transition-colors'
            >
              <svg className='w-5 h-5' viewBox='0 0 24 24'>
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              <span className='ml-2'>Google</span>
            </button>
            <button
              type='button'
              className='flex justify-center items-center py-3 px-4 border border-soft-gray dark:border-gray-700 rounded-lg hover:bg-soft-gray dark:hover:bg-gray-700 transition-colors'
            >
              <svg className='w-5 h-5' fill='#1877F2' viewBox='0 0 24 24'>
                <path d='M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.56-4.7 1.32 0 2.7.24 2.7.24v2.97h-1.52c-1.5 0-1.96.93-1.96 1.88v2.26h3.34l-.53 3.49h-2.81V24C19.62 23.1 24 18.1 24 12.07z' />
              </svg>
              <span className='ml-2'>Facebook</span>
            </button>
          </div>
        </form>

        <p className='text-center text-sm text-dark-text/60 dark:text-gray-400'>
          Don't have an account?{' '}
          <Link
            to='/register'
            className='text-royal-blue hover:text-indigo font-semibold transition-colors'
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
