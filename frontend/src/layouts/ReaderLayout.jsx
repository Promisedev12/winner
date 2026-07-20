import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiClock,
  FiBookmark,
  FiUserPlus,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBookOpen,
  FiAward,
  FiTrendingUp,
} from 'react-icons/fi';

// Navigation items for reader sidebar
const navItems = [
  { path: '/reader/dashboard', name: 'Dashboard', icon: <FiHome size={18} /> },
  {
    path: '/reader/history',
    name: 'Reading History',
    icon: <FiClock size={18} />,
  },
  {
    path: '/reader/bookmarks',
    name: 'Bookmarks',
    icon: <FiBookmark size={18} />,
  },
  {
    path: '/reader/following',
    name: 'Following',
    icon: <FiUserPlus size={18} />,
  },
  {
    path: '/reader/settings',
    name: 'Settings',
    icon: <FiSettings size={18} />,
  },
];

export default function ReaderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD',
    readingStreak: 12,
    booksRead: 47,
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

              {/* User Profile Summary */}
              <div className='mt-6 flex items-center space-x-3'>
                <div className='w-12 h-12 rounded-full gradient-bg-main flex items-center justify-center text-white font-bold text-lg'>
                  {user.avatar}
                </div>
                <div>
                  <p className='font-semibold text-white'>{user.name}</p>
                  <p className='text-sm text-slate-400'>Reader since 2024</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className='mt-4 grid grid-cols-2 gap-2'>
                <div className='bg-slate-700/50 rounded-lg p-2 text-center'>
                  <FiTrendingUp className='w-4 h-4 text-emerald mx-auto mb-1' />
                  <p className='text-xs text-slate-400'>Streak</p>
                  <p className='text-sm font-bold text-white'>
                    {user.readingStreak} days
                  </p>
                </div>
                <div className='bg-slate-700/50 rounded-lg p-2 text-center'>
                  <FiBookOpen className='w-4 h-4 text-royal-blue mx-auto mb-1' />
                  <p className='text-xs text-slate-400'>Read</p>
                  <p className='text-sm font-bold text-white'>
                    {user.booksRead} items
                  </p>
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
                <FiBookOpen size={18} />
                <span>Browse Content</span>
              </Link>
              <button className='flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-500 transition-all'>
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
