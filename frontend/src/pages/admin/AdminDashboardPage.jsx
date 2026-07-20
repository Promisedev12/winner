import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiUserCheck,
  FiFileText,
  FiBook,
  FiFlag,
  FiTrendingUp,
  FiDollarSign,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiArrowRight,
  FiRefreshCw,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import adminService from '../../services/adminService';

export default function AdminDashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('year');
  const [stats, setStats] = useState({
    users: { total_users: 0, active_users: 0, new_today: 0 },
    blogs: { total_blogs: 0, published_blogs: 0, new_today: 0 },
    books: { total_books: 0, published_books: 0, new_today: 0 },
    revenue: { total_revenue: 0, monthly_revenue: 0 },
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchDashboardData();
  }, []);

 const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const [dashboardData, analyticsData] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getPlatformStats()
    ]);
    
    if (dashboardData.success) {
      setStats(dashboardData.data);
    }
    
    if (analyticsData.success) {
      setMonthlyData(analyticsData.data.monthly_growth || []);
    }
    
    // Remove activity logs - separate API call not needed for dashboard
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Don't show error notification for missing endpoints - just use mock data
  } finally {
    setLoading(false);
  }
};

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const userDistribution = [
    { name: 'Readers', value: stats.users.total_users * 0.7, color: '#2563EB' },
    {
      name: 'Bloggers',
      value: stats.users.total_users * 0.2,
      color: '#10B981',
    },
    { name: 'Authors', value: stats.users.total_users * 0.1, color: '#F59E0B' },
  ];

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>
            {greeting}, Admin! 👋
          </h1>
          <p className='text-slate-400 mt-1'>
            Here's what's happening on your platform today
          </p>
        </div>
        <div className='flex gap-3'>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className='px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm'
          >
            <option value='week'>Last 7 days</option>
            <option value='month'>Last 30 days</option>
            <option value='year'>This year</option>
          </select>
          <button
            onClick={handleRefresh}
            className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
          >
            <FiRefreshCw
              className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiUsers className='text-royal-blue' />
            <span className='text-xs text-slate-500'>Total</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.users.total_users?.toLocaleString() || 0}
          </p>
          <p className='text-xs text-slate-400'>Total Users</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiFileText className='text-emerald' />
            <span className='text-xs text-slate-500'>Content</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.blogs.total_blogs?.toLocaleString() || 0}
          </p>
          <p className='text-xs text-slate-400'>Total Blogs</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiBook className='text-indigo' />
            <span className='text-xs text-slate-500'>Books</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.books.total_books?.toLocaleString() || 0}
          </p>
          <p className='text-xs text-slate-400'>Total Books</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiDollarSign className='text-amber-500' />
            <span className='text-xs text-slate-500'>Revenue</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            ${stats.revenue.total_revenue?.toLocaleString() || 0}
          </p>
          <p className='text-xs text-slate-400'>Total Revenue</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiUserCheck className='text-amber-500' />
            <span className='text-xs text-slate-500'>Active</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.users.active_users || 0}
          </p>
          <p className='text-xs text-slate-400'>Active Users</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiTrendingUp className='text-emerald' />
            <span className='text-xs text-slate-500'>Growth</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.users.new_today || 0}
          </p>
          <p className='text-xs text-slate-400'>New Today</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className='grid lg:grid-cols-2 gap-8 mb-8'>
        {/* Revenue & Users Chart */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-semibold text-white'>
              Platform Growth
            </h3>
            <span className='text-xs text-slate-400'>Last 12 months</span>
          </div>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
              <XAxis dataKey='month' stroke='#94A3B8' />
              <YAxis stroke='#94A3B8' />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                }}
                labelStyle={{ color: '#F1F5F9' }}
              />
              <Area
                type='monotone'
                dataKey='new_users'
                stroke='#2563EB'
                fill='#2563EB'
                fillOpacity={0.2}
                name='New Users'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            User Distribution
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey='value'
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: '#94A3B8' }}
              >
                {userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className='flex justify-center gap-6 mt-4'>
            {userDistribution.map((item, index) => (
              <div key={index} className='flex items-center gap-2'>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className='text-xs text-slate-400'>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Recent Activity */}
        <div className='lg:col-span-2'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold text-white'>Recent Activity</h2>
            <Link
              to='/admin/activity-logs'
              className='text-royal-blue text-sm flex items-center'
            >
              View all <FiArrowRight className='ml-1' />
            </Link>
          </div>
          <div className='space-y-3'>
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className='bg-slate-800 rounded-xl p-4 border border-slate-700'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <p className='font-semibold text-white'>
                      {activity.user_name || 'System'}
                    </p>
                    <p className='text-sm text-slate-400'>{activity.action}</p>
                    <p className='text-xs text-slate-500 mt-1 flex items-center gap-1'>
                      <FiCalendar size={10} />{' '}
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className='text-xl font-bold text-white mb-4'>Quick Stats</h2>
          <div className='space-y-3'>
            <Link
              to='/admin/users'
              className='block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-royal-blue transition-all'
            >
              <div className='flex justify-between items-center'>
                <div>
                  <p className='text-sm text-slate-400'>Total Users</p>
                  <p className='text-2xl font-bold text-white'>
                    {stats.users.total_users?.toLocaleString() || 0}
                  </p>
                </div>
                <FiUsers className='text-royal-blue w-8 h-8' />
              </div>
            </Link>

            <Link
              to='/admin/blogs'
              className='block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-royal-blue transition-all'
            >
              <div className='flex justify-between items-center'>
                <div>
                  <p className='text-sm text-slate-400'>Total Blogs</p>
                  <p className='text-2xl font-bold text-white'>
                    {stats.blogs.total_blogs?.toLocaleString() || 0}
                  </p>
                </div>
                <FiFileText className='text-emerald w-8 h-8' />
              </div>
            </Link>

            <Link
              to='/admin/books'
              className='block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-royal-blue transition-all'
            >
              <div className='flex justify-between items-center'>
                <div>
                  <p className='text-sm text-slate-400'>Total Books</p>
                  <p className='text-2xl font-bold text-white'>
                    {stats.books.total_books?.toLocaleString() || 0}
                  </p>
                </div>
                <FiBook className='text-indigo w-8 h-8' />
              </div>
            </Link>

            <Link
              to='/admin/revenue'
              className='block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-royal-blue transition-all'
            >
              <div className='flex justify-between items-center'>
                <div>
                  <p className='text-sm text-slate-400'>Total Revenue</p>
                  <p className='text-2xl font-bold text-white'>
                    ${stats.revenue.total_revenue?.toLocaleString() || 0}
                  </p>
                </div>
                <FiDollarSign className='text-amber-500 w-8 h-8' />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
