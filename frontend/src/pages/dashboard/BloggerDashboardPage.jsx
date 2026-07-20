import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiFileText,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiTrendingUp,
  FiUsers,
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiRefreshCw,
  FiEdit3,
  FiCalendar,
  FiClock,
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
} from 'recharts';
import bloggerService from '../../services/bloggerService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';

export default function BloggerDashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_posts: 0,
    published_posts: 0,
    draft_posts: 0,
    scheduled_posts: 0,
    total_views: 0,
    total_likes: 0,
    pending_comments: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

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
      const response = await bloggerService.getDashboardStats();
      if (response.success) {
        setStats(response.data.stats);
        setChartData(response.data.chart_data || []);
        setRecentPosts(response.data.recent_posts || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

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
            {greeting}, {user?.name?.split(' ')[0]}! ✍️
          </h1>
          <p className='text-slate-400 mt-1'>
            Your blog is performing great today
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw
            className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiFileText className='text-royal-blue' />
            <span className='text-xs text-slate-500'>Total</span>
          </div>
          <p className='text-2xl font-bold text-white'>{stats.total_posts}</p>
          <p className='text-xs text-slate-400'>Posts Published</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiEye className='text-emerald' />
            <span className='text-xs text-slate-500'>Lifetime</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.total_views.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Views</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiHeart className='text-rose-500' />
            <span className='text-xs text-slate-500'>Likes</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.total_likes.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Likes</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiMessageCircle className='text-indigo' />
            <span className='text-xs text-slate-500'>Comments</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.pending_comments}
          </p>
          <p className='text-xs text-slate-400'>Pending Comments</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiFileText className='text-amber-500' />
            <span className='text-xs text-slate-500'>Drafts</span>
          </div>
          <p className='text-2xl font-bold text-white'>{stats.draft_posts}</p>
          <p className='text-xs text-slate-400'>Draft Posts</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiCalendar className='text-emerald' />
            <span className='text-xs text-slate-500'>Scheduled</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.scheduled_posts}
          </p>
          <p className='text-xs text-slate-400'>Scheduled Posts</p>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-8 mb-8'>
        <div className='lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Views & Engagement Overview
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={chartData}>
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
                dataKey='views'
                stroke='#2563EB'
                fill='#2563EB'
                fillOpacity={0.2}
                name='Views'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>Quick Stats</h3>
          <div className='space-y-4'>
            <div className='bg-gradient-to-r from-royal-blue/10 to-indigo/10 rounded-xl p-4 border border-royal-blue/20'>
              <p className='text-sm text-slate-400'>Average Views per Post</p>
              <p className='text-2xl font-bold text-white'>
                {stats.total_posts > 0
                  ? Math.round(
                      stats.total_views / stats.total_posts,
                    ).toLocaleString()
                  : 0}
              </p>
            </div>
            <div className='bg-gradient-to-r from-emerald/10 to-teal/10 rounded-xl p-4 border border-emerald/20'>
              <p className='text-sm text-slate-400'>Average Likes per Post</p>
              <p className='text-2xl font-bold text-white'>
                {stats.total_posts > 0
                  ? Math.round(
                      stats.total_likes / stats.total_posts,
                    ).toLocaleString()
                  : 0}
              </p>
            </div>
            <div className='bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20'>
              <p className='text-sm text-slate-400'>Engagement Rate</p>
              <p className='text-2xl font-bold text-white'>
                {stats.total_views > 0
                  ? ((stats.total_likes / stats.total_views) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid lg:grid-cols-2 gap-8'>
        <div>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold text-white'>Recent Posts</h2>
            <Link
              to='/blogger/posts'
              className='text-royal-blue text-sm flex items-center'
            >
              View all <FiArrowRight className='ml-1' />
            </Link>
          </div>
          <div className='space-y-3'>
            {recentPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className='bg-slate-800 rounded-xl p-4 border border-slate-700'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          post.status === 'published'
                            ? 'bg-emerald/20 text-emerald'
                            : post.status === 'scheduled'
                              ? 'bg-amber-500/20 text-amber-500'
                              : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <h3 className='font-semibold text-white'>{post.title}</h3>
                    <div className='flex items-center gap-3 mt-2 text-xs text-slate-500'>
                      <span className='flex items-center gap-1'>
                        <FiEye size={12} /> {post.views} views
                      </span>
                      <span className='flex items-center gap-1'>
                        <FiHeart size={12} /> {post.likes} likes
                      </span>
                      <span className='flex items-center gap-1'>
                        <FiClock size={12} />{' '}
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/blogger/edit/${post.id}`}
                    className='text-royal-blue hover:text-indigo'
                  >
                    <FiEdit3 />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className='text-xl font-bold text-white mb-4'>Quick Actions</h2>
          <div className='grid gap-4'>
            <Link
              to='/blogger/create'
              className='bg-gradient-to-r from-royal-blue/10 to-indigo/10 rounded-xl p-6 border border-royal-blue/20 hover:border-royal-blue transition-all'
            >
              <FiEdit3 className='w-8 h-8 text-royal-blue mb-3' />
              <h3 className='font-semibold text-white mb-1'>Write New Post</h3>
              <p className='text-slate-400 text-sm'>
                Share your ideas with the world
              </p>
            </Link>

            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='font-semibold text-white mb-3'>Blogging Tips</h3>
              <div className='space-y-3'>
                <div className='flex gap-2'>
                  <FiAward className='text-royal-blue mt-1' />
                  <p className='text-sm text-slate-400'>
                    Posts with images get 2x more engagement
                  </p>
                </div>
                <div className='flex gap-2'>
                  <FiCalendar className='text-emerald mt-1' />
                  <p className='text-sm text-slate-400'>
                    Best time to post: Tuesday & Thursday 10 AM
                  </p>
                </div>
                <div className='flex gap-2'>
                  <FiClock className='text-indigo mt-1' />
                  <p className='text-sm text-slate-400'>
                    Ideal post length: 1,500 - 2,000 words
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
