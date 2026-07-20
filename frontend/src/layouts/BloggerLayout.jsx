import { useState, useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiEdit3,
  FiFileText,
  FiCalendar,
  FiBarChart2,
  FiMessageCircle,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiStar,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';

// Navigation items for blogger sidebar
const navItems = [
  { path: '/blogger/dashboard', name: 'Dashboard', icon: <FiHome size={18} /> },
  { path: '/blogger/posts', name: 'My Posts', icon: <FiFileText size={18} /> },
  { path: '/blogger/create', name: 'Write Post', icon: <FiEdit3 size={18} /> },
  { path: '/blogger/drafts', name: 'Drafts', icon: <FiFileText size={18} /> },
  {
    path: '/blogger/scheduled',
    name: 'Scheduled',
    icon: <FiCalendar size={18} />,
  },
  {
    path: '/blogger/analytics',
    name: 'Analytics',
    icon: <FiBarChart2 size={18} />,
  },
  {
    path: '/blogger/comments',
    name: 'Comments',
    icon: <FiMessageCircle size={18} />,
  },
  {
    path: '/blogger/settings',
    name: 'Settings',
    icon: <FiSettings size={18} />,
  },
];

export default function BloggerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className='min-h-screen bg-slate-900'>
      <div className='flex'>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 bg-black/50 z-40 lg:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`
          fixed lg:sticky top-0 left-0 z-50 w-72 h-screen bg-slate-800 border-r border-slate-700
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        >
          <div className='flex flex-col h-full'>
            {/* Sidebar Header */}
            <div className='p-6 border-b border-slate-700'>
              <div className='flex items-center justify-between'>
                <Link to='/' className='flex items-center space-x-2'>
                  <div className='w-8 h-8 gradient-bg-main rounded-lg flex items-center justify-center'>
                    <span className='text-white font-bold text-lg'>B</span>
                  </div>
                  <span className='text-xl font-bold gradient-text'>
                    BlogLib
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className='lg:hidden p-2 rounded-lg bg-slate-700 text-slate-400'
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Blogger Profile Summary */}
              <div className='mt-6 flex items-center space-x-3'>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='w-12 h-12 rounded-full object-cover'
                  />
                ) : (
                  <div className='w-12 h-12 rounded-full gradient-bg-main flex items-center justify-center text-white font-bold text-lg'>
                    {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                  </div>
                )}
                <div>
                  <p className='font-semibold text-white'>{user?.name || 'Blogger'}</p>
                  <p className='text-sm text-slate-400'>Blogger</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className='mt-4 grid grid-cols-2 gap-2'>
                <div className='bg-slate-700/50 rounded-lg p-2 text-center'>
                  <FiFileText className='w-4 h-4 text-royal-blue mx-auto mb-1' />
                  <p className='text-xs text-slate-400'>Posts</p>
                  <p className='text-sm font-bold text-white'>47</p>
                </div>
                <div className='bg-slate-700/50 rounded-lg p-2 text-center'>
                  <FiTrendingUp className='w-4 h-4 text-emerald mx-auto mb-1' />
                  <p className='text-xs text-slate-400'>Views</p>
                  <p className='text-sm font-bold text-white'>156K</p>
                </div>
                <div className='bg-slate-700/50 rounded-lg p-2 text-center'>
                  <FiStar className='w-4 h-4 text-yellow-500 mx-auto mb-1' />
                  <p className='text-xs text-slate-400'>Likes</p>
                  <p className='text-sm font-bold text-white'>12.3K</p>
                </div>
                <div className='bg-slate-700/50 rounded-lg p-2 text-center'>
                  <FiUsers className='w-4 h-4 text-indigo mx-auto mb-1' />
                  <p className='text-xs text-slate-400'>Followers</p>
                  <p className='text-sm font-bold text-white'>8.9K</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className='flex-1 py-6 px-4 space-y-1'>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                    ${
                      isActive(item.path)
                        ? 'gradient-bg-main text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {isActive(item.path) && (
                    <motion.div
                      layoutId='active-indicator'
                      className='ml-auto w-1.5 h-1.5 rounded-full bg-white'
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className='p-4 border-t border-slate-700 space-y-2'>
              <Link
                to='/'
                className='flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-slate-300 hover:bg-slate-700 transition-all'
              >
                <FiFileText size={18} />
                <span>Browse Blogs</span>
              </Link>
              <button
                onClick={handleLogout}
                className='flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-500 transition-all'
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 min-w-0'>
          {/* Mobile Header */}
          <div className='lg:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3'>
            <button
              onClick={() => setSidebarOpen(true)}
              className='p-2 rounded-lg bg-slate-800 text-white'
            >
              <FiMenu size={20} />
            </button>
          </div>

          {/* Render child pages here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}