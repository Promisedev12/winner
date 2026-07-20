import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  PenTool,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: <LayoutDashboard className='w-5 h-5' />,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: <PenTool className='w-5 h-5' />,
      label: 'My Blogs',
      path: '/dashboard/blogs',
    },
    {
      icon: <BookOpen className='w-5 h-5' />,
      label: 'My Books',
      path: '/dashboard/books',
    },
    {
      icon: <Users className='w-5 h-5' />,
      label: 'Followers',
      path: '/dashboard/followers',
    },
    {
      icon: <Settings className='w-5 h-5' />,
      label: 'Settings',
      path: '/dashboard/settings',
    },
  ];

  return (
    <div className='min-h-screen bg-soft-white dark:bg-midnight-dark'>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className='lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-primary rounded-full shadow-lg text-white'
      >
        {sidebarOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className='p-6'>
          <div className='flex items-center gap-2 mb-8'>
            <div className='w-8 h-8 bg-gradient-to-br from-primary to-lavender rounded-lg flex items-center justify-center'>
              <PenTool className='w-4 h-4 text-white' />
            </div>
            <span className='font-bold'>Dashboard</span>
          </div>

          <nav className='space-y-2'>
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.path}
                className='flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all'
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}

            <button
              onClick={logout}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose hover:bg-rose/10 transition-all mt-8'
            >
              <LogOut className='w-5 h-5' />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className='lg:ml-72'>
        <main className='p-6 lg:p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
