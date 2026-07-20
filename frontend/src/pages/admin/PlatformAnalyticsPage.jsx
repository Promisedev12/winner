import { useState, useEffect, useContext } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiBook,
  FiDollarSign,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function PlatformAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalBooks: 0,
    totalRevenue: 0,
    avgEngagement: 0,
    monthlyActiveUsers: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [contentData, setContentData] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [platformStats, revenueStats] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getRevenueStats(timeRange),
      ]);

      if (platformStats.success) {
        setUserGrowthData(platformStats.data.monthly_growth || []);
        setRoleDistribution(platformStats.data.role_distribution || []);

        // Calculate totals
        const totalUsers =
          platformStats.data.role_distribution?.reduce(
            (acc, r) => acc + (r.count || 0),
            0,
          ) || 0;
        setStats((prev) => ({
          ...prev,
          totalUsers,
          totalBlogs:
            platformStats.data.content_distribution?.find(
              (c) => c.type === 'blogs',
            )?.count || 0,
          totalBooks:
            platformStats.data.content_distribution?.find(
              (c) => c.type === 'books',
            )?.count || 0,
        }));
      }

      if (revenueStats.success) {
        setStats((prev) => ({
          ...prev,
          totalRevenue: revenueStats.data.total_stats?.total_revenue || 0,
        }));
        setContentData(revenueStats.data.revenue_data || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification('Failed to fetch analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const engagementData = [
    { name: 'Views', value: 65, color: '#2563EB' },
    { name: 'Likes', value: 20, color: '#10B981' },
    { name: 'Comments', value: 10, color: '#F59E0B' },
    { name: 'Shares', value: 5, color: '#8B5CF6' },
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
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>
            Platform Analytics
          </h1>
          <p className='text-slate-400 mt-1'>
            Deep insights into platform performance
          </p>
        </div>
        <div className='flex gap-3'>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className='px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white'
          >
            <option value='week'>Last 7 days</option>
            <option value='month'>Last 30 days</option>
            <option value='year'>Last 12 months</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
          >
            <FiRefreshCw className='text-slate-400' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiUsers className='w-4 h-4 text-royal-blue' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.totalUsers.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Users</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiFileText className='w-4 h-4 text-emerald' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.totalBlogs.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Blogs</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiBook className='w-4 h-4 text-indigo' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.totalBooks.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Books</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiDollarSign className='w-4 h-4 text-amber-500' />
          </div>
          <p className='text-xl font-bold text-white'>
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Revenue</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiTrendingUp className='w-4 h-4 text-emerald' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.avgEngagement || 72.5}%
          </p>
          <p className='text-xs text-slate-400'>Avg Engagement</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiUsers className='w-4 h-4 text-royal-blue' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.monthlyActiveUsers || 18420}
          </p>
          <p className='text-xs text-slate-400'>Monthly Active</p>
        </div>
      </div>

      <div className='bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8'>
        <h3 className='text-lg font-semibold text-white mb-4'>User Growth</h3>
        <ResponsiveContainer width='100%' height={350}>
          <AreaChart data={userGrowthData}>
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

      <div className='grid lg:grid-cols-2 gap-8 mb-8'>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Content Distribution
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Blogs', value: stats.totalBlogs, color: '#2563EB' },
                  { name: 'Books', value: stats.totalBooks, color: '#10B981' },
                ]}
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
                <Cell fill='#2563EB' />
                <Cell fill='#10B981' />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Role Distribution
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={roleDistribution}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey='count'
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: '#94A3B8' }}
              >
                {roleDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6'][index % 4]
                    }
                  />
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
        </div>
      </div>

      <div className='grid lg:grid-cols-2 gap-8'>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Revenue Trend
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={contentData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
              <XAxis dataKey='date' stroke='#94A3B8' />
              <YAxis stroke='#94A3B8' />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                }}
                labelStyle={{ color: '#F1F5F9' }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Line
                type='monotone'
                dataKey='revenue'
                stroke='#10B981'
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
                name='Revenue'
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Engagement Distribution
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={engagementData}
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
                {engagementData.map((entry, index) => (
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
          <div className='flex justify-center gap-4 mt-4'>
            {engagementData.map((item, index) => (
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
    </div>
  );
}
