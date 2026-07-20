import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUserPlus,
} from 'react-icons/fi';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    selected_role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      selected_role: formData.selected_role,
    });

    if (result.success) {
      showNotification('Registration successful!', 'success');
      // Navigate to choose role page if they selected a role, otherwise go to dashboard
      if (formData.selected_role) {
        navigate('/choose-role');
      } else {
        navigate('/reader/dashboard');
      }
    } else {
      showNotification(result.message, 'error');
    }

    setLoading(false);
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
            Create Account
          </h2>
          <p className='mt-2 text-dark-text/60 dark:text-gray-400'>
            Join the BlogLib community today
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-dark-text dark:text-gray-300 mb-2'
              >
                Full Name
              </label>
              <div className='relative'>
                <FiUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  id='name'
                  name='name'
                  type='text'
                  autoComplete='name'
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className='w-full pl-10 pr-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-royal-blue focus:outline-none transition-colors'
                  placeholder='John Doe'
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
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
                  autoComplete='new-password'
                  required
                  value={formData.password}
                  onChange={handleChange}
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

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-dark-text dark:text-gray-300 mb-2'
              >
                Confirm Password
              </label>
              <div className='relative'>
                <FiLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='w-full pl-10 pr-12 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-royal-blue focus:outline-none transition-colors'
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-royal-blue transition-colors'
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-dark-text dark:text-gray-300 mb-2'>
                I want to (Optional)
              </label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() =>
                    setFormData({ ...formData, selected_role: 'blogger' })
                  }
                  className={`py-3 px-4 rounded-lg border transition-all ${
                    formData.selected_role === 'blogger'
                      ? 'border-royal-blue bg-royal-blue/10 text-royal-blue'
                      : 'border-soft-gray dark:border-gray-700 text-slate-400 hover:border-royal-blue'
                  }`}
                >
                  📝 Be a Blogger
                </button>
                <button
                  type='button'
                  onClick={() =>
                    setFormData({ ...formData, selected_role: 'author' })
                  }
                  className={`py-3 px-4 rounded-lg border transition-all ${
                    formData.selected_role === 'author'
                      ? 'border-royal-blue bg-royal-blue/10 text-royal-blue'
                      : 'border-soft-gray dark:border-gray-700 text-slate-400 hover:border-royal-blue'
                  }`}
                >
                  📚 Be an Author
                </button>
              </div>
              <p className='text-xs text-slate-500 mt-2'>
                You can always change this later
              </p>
            </div>
          </div>

          <div className='flex items-center'>
            <input
              id='terms'
              name='terms'
              type='checkbox'
              required
              className='h-4 w-4 text-royal-blue focus:ring-royal-blue border-soft-gray rounded'
            />
            <label
              htmlFor='terms'
              className='ml-2 block text-sm text-dark-text/70 dark:text-gray-400'
            >
              I agree to the{' '}
              <Link
                to='/terms'
                className='text-royal-blue hover:text-indigo transition-colors'
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to='/privacy'
                className='text-royal-blue hover:text-indigo transition-colors'
              >
                Privacy Policy
              </Link>
            </label>
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
                Create Account <FiUserPlus className='ml-2' />
              </>
            )}
          </button>
        </form>

        <p className='text-center text-sm text-dark-text/60 dark:text-gray-400'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-royal-blue hover:text-indigo font-semibold transition-colors'
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
