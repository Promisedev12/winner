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
  FiEye,
  FiHeart,
  FiUsers,
  FiCalendar,
  FiMessageCircle,
  FiShare2,
  FiRefreshCw,
  FiDownload,
  FiFileText,
} from 'react-icons/fi';
import bloggerService from '../../services/bloggerService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function BloggerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await bloggerService.getAnalytics(timeRange);
      if (response.success) {
        setChartData(response.data.chart_data || []);
        setTopPosts(response.data.top_posts || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification('Failed to fetch analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalViews: chartData.reduce((acc, d) => acc + (d.views || 0), 0),
    totalLikes: chartData.reduce((acc, d) => acc + (d.likes || 0), 0),
    totalPosts: chartData.reduce((acc, d) => acc + (d.posts || 0), 0),
    avgViewsPerPost:
      chartData.reduce((acc, d) => acc + (d.views || 0), 0) /
      (chartData.reduce((acc, d) => acc + (d.posts || 0), 0) || 1),
    bestDay:
      chartData.length > 0
        ? chartData.reduce((a, b) => (a.views > b.views ? a : b)).date
        : 'N/A',
  };

  const categoryData = [
    { name: 'Technology', value: 45, color: '#2563EB' },
    { name: 'Programming', value: 30, color: '#10B981' },
    { name: 'AI', value: 15, color: '#F59E0B' },
    { name: 'Business', value: 10, color: '#8B5CF6' },
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
            Analytics
          </h1>
          <p className='text-slate-400 mt-1'>Track your blog performance</p>
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
          <button className='btn-secondary text-sm py-2 px-4'>
            <FiDownload className='mr-2' /> Export
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiEye className='w-4 h-4 text-royal-blue' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.totalViews.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Views</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiHeart className='w-4 h-4 text-rose-500' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.totalLikes.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Likes</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiFileText className='w-4 h-4 text-emerald' />
          </div>
          <p className='text-xl font-bold text-white'>{stats.totalPosts}</p>
          <p className='text-xs text-slate-400'>Posts Published</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiTrendingUp className='w-4 h-4 text-amber-500' />
          </div>
          <p className='text-xl font-bold text-white'>
            {Math.round(stats.avgViewsPerPost).toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Avg Views/Post</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiCalendar className='w-4 h-4 text-indigo' />
          </div>
          <p className='text-xl font-bold text-white'>{stats.bestDay}</p>
          <p className='text-xs text-slate-400'>Best Day</p>
        </div>
      </div>

      <div className='bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Views & Engagement Overview
        </h3>
        <ResponsiveContainer width='100%' height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
            <XAxis dataKey='date' stroke='#94A3B8' />
            <YAxis yAxisId='left' stroke='#94A3B8' />
            <YAxis yAxisId='right' orientation='right' stroke='#94A3B8' />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
              }}
              labelStyle={{ color: '#F1F5F9' }}
            />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='views'
              stroke='#2563EB'
              strokeWidth={2}
              dot={{ fill: '#2563EB' }}
              name='Views'
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='likes'
              stroke='#10B981'
              strokeWidth={2}
              dot={{ fill: '#10B981' }}
              name='Likes'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className='grid lg:grid-cols-2 gap-8'>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Top Performing Posts
          </h3>
          <div className='space-y-4'>
            {topPosts.map((post, index) => (
              <div key={post.id} className='p-3 bg-slate-700/30 rounded-lg'>
                <div className='flex justify-between items-start mb-2'>
                  <h4 className='font-semibold text-white'>{post.title}</h4>
                  <span className='text-xs text-royal-blue'>#{index + 1}</span>
                </div>
                <div className='flex gap-4 text-sm text-slate-400'>
                  <span className='flex items-center gap-1'>
                    <FiEye size={12} /> {post.views.toLocaleString()} views
                  </span>
                  <span className='flex items-center gap-1'>
                    <FiHeart size={12} /> {post.likes} likes
                  </span>
                  <span className='flex items-center gap-1'>
                    <FiMessageCircle size={12} /> {post.comments_count || 0}{' '}
                    comments
                  </span>
                </div>
              </div>
            ))}
          </div>
          {topPosts.length === 0 && (
            <p className='text-slate-400 text-center py-8'>No posts found</p>
          )}
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Content by Category
          </h3>
          <ResponsiveContainer width='100%' height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey='value'
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: '#94A3B8' }}
              >
                {categoryData.map((entry, index) => (
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
            {categoryData.map((item, index) => (
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

      <div className='mt-8 bg-gradient-to-r from-royal-blue/10 to-indigo/10 rounded-xl p-6 border border-royal-blue/20'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          📊 Best Time to Post
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
          <div>
            <p className='text-2xl font-bold text-royal-blue'>Tuesday</p>
            <p className='text-xs text-slate-400'>Best Day</p>
          </div>
          <div>
            <p className='text-2xl font-bold text-royal-blue'>10:00 AM</p>
            <p className='text-xs text-slate-400'>Best Time</p>
          </div>
          <div>
            <p className='text-2xl font-bold text-emerald'>+45%</p>
            <p className='text-xs text-slate-400'>More Engagement</p>
          </div>
          <div>
            <p className='text-2xl font-bold text-indigo'>2-3x</p>
            <p className='text-xs text-slate-400'>Higher CTR</p>
          </div>
        </div>
      </div>
    </div>
  );
}
