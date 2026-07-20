import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiFileText,
  FiBook,
  FiFlag,
  FiBarChart2,
  FiDollarSign,
  FiCreditCard,
  FiSettings,
  FiBell,
  FiActivity,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
  FiTrendingUp,
  FiStar,
} from 'react-icons/fi';

// Navigation items for admin sidebar
const navItems = [
  { path: '/admin/dashboard', name: 'Dashboard', icon: <FiHome size={18} /> },
  { path: '/admin/users', name: 'Users', icon: <FiUsers size={18} /> },
  {
    path: '/admin/role-approvals',
    name: 'Role Approvals',
    icon: <FiUserCheck size={18} />,
    badge: 3,
  },
  {
    path: '/admin/blogs',
    name: 'Blogs Moderation',
    icon: <FiFileText size={18} />,
  },
  {
    path: '/admin/books',
    name: 'Books Moderation',
    icon: <FiBook size={18} />,
  },
  {
    path: '/admin/reported',
    name: 'Reported Content',
    icon: <FiFlag size={18} />,
    badge: 2,
  },
  {
    path: '/admin/analytics',
    name: 'Analytics',
    icon: <FiBarChart2 size={18} />,
  },
  { path: '/admin/revenue', name: 'Revenue', icon: <FiDollarSign size={18} /> },
  {
    path: '/admin/subscriptions',
    name: 'Subscriptions',
    icon: <FiCreditCard size={18} />,
  },
  {
    path: '/admin/notifications',
    name: 'Broadcast',
    icon: <FiBell size={18} />,
  },
  {
    path: '/admin/activity-logs',
    name: 'Activity Logs',
    icon: <FiActivity size={18} />,
  },
  { path: '/admin/settings', name: 'Settings', icon: <FiSettings size={18} /> },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Mock admin data
  const admin = {
    name: 'Admin User',
    email: 'admin@bloglib.com',
    avatar: 'AD',
    role: 'Super Admin',
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

              {/* Admin Profile Summary */}
              <div className='mt-6 flex items-center space-x-3'>
                <div className='w-12 h-12 rounded-full gradient-bg-main flex items-center justify-center text-white font-bold text-lg'>
                  {admin.avatar}
                </div>
                <div>
                  <p className='font-semibold text-white'>{admin.name}</p>
                  <p className='text-sm text-slate-400'>{admin.role}</p>
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
                    flex items-center justify-between px-4 py-3 rounded-lg transition-all
                    ${
                      isActive(item.path)
                        ? 'gradient-bg-main text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  <div className='flex items-center space-x-3'>
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className='bg-red-500 text-white text-xs px-2 py-0.5 rounded-full'>
                      {item.badge}
                    </span>
                  )}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId='active-indicator'
                      className='w-1.5 h-1.5 rounded-full bg-white'
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
                <FiTrendingUp size={18} />
                <span>View Site</span>
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
