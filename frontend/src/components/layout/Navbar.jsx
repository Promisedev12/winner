import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogIn,
  FiBookOpen,
  FiHome,
  FiBook,
  FiDollarSign,
  FiInfo,
  FiMail,
  FiLogOut,
  FiUserCheck,
} from 'react-icons/fi';
import { AuthContext } from '../../contexts/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout, userRoles } = useContext(AuthContext);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome className='mr-2' /> },
    { name: 'Blogs', path: '/blogs', icon: <FiBookOpen className='mr-2' /> },
    { name: 'Books', path: '/books', icon: <FiBook className='mr-2' /> },
    {
      name: 'Pricing',
      path: '/pricing',
      icon: <FiDollarSign className='mr-2' />,
    },
    { name: 'About', path: '/about', icon: <FiInfo className='mr-2' /> },
    { name: 'Contact', path: '/contact', icon: <FiMail className='mr-2' /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (userRoles.includes('admin')) return '/admin/dashboard';
    if (userRoles.includes('blogger')) return '/blogger/dashboard';
    if (userRoles.includes('author')) return '/author/dashboard';
    return '/reader/dashboard';
  };

  return (
    <nav className='bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-2 group shrink-0'>
            <div className='w-9 h-9 gradient-bg-main rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform'>
              <span className='text-white font-bold text-xl'>B</span>
            </div>
            <span className='text-xl font-bold gradient-text'>BlogLib</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center justify-center flex-1 px-8'>
            <div className='flex items-center space-x-8'>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className='text-slate-300 hover:text-royal-blue transition-colors font-medium flex items-center text-sm'
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className='hidden md:flex items-center space-x-3 shrink-0'>
            {isAuthenticated && user ? (
              <div className='relative'>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className='flex items-center space-x-2 text-slate-300 hover:text-royal-blue transition-colors'
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className='w-8 h-8 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-full gradient-bg-main flex items-center justify-center text-white text-sm'>
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className='text-sm'>{user.name?.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50'>
                    <Link
                      to={getDashboardLink()}
                      className='block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white'
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to='/profile'
                      className='block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white'
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to='/settings'
                      className='block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white'
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <hr className='my-1 border-slate-700' />
                    <button
                      onClick={handleLogout}
                      className='block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700'
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center space-x-3'>
                <Link
                  to='/login'
                  className='px-4 py-2 text-sm border border-royal-blue text-royal-blue rounded-lg hover:bg-royal-blue/10 transition-all'
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  className='px-4 py-2 text-sm gradient-bg-main text-white rounded-lg hover:shadow-lg transition-all'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden p-2 rounded-lg bg-slate-800 text-white'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden py-4 border-t border-slate-800'
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className='flex items-center py-3 text-slate-300 hover:text-royal-blue transition-colors'
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className='pt-4 border-t border-slate-800 mt-2'>
              {isAuthenticated && user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className='block py-3 text-slate-300 hover:text-royal-blue'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className='block w-full text-left py-3 text-red-500'
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className='space-y-3'>
                  <Link
                    to='/login'
                    className='block py-3 text-slate-300 hover:text-royal-blue'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to='/register'
                    className='block text-center px-4 py-3 gradient-bg-main text-white rounded-lg'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
