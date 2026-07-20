import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiBook,
  FiDownload,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiEye,
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiRefreshCw,
  FiUpload,
  FiEdit,
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
import authorService from '../../services/authService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';

export default function AuthorDashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_books: 0,
    published_books: 0,
    draft_books: 0,
    total_downloads: 0,
    avg_rating: 0,
    total_reviews: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
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
      const response = await authorService.getDashboardStats();
      if (response.success) {
        setStats(response.data.stats);
        setChartData(response.data.chart_data || []);
        setRecentBooks(response.data.recent_books || []);
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
            {greeting}, {user?.name?.split(' ')[0]}! 👩‍🏫
          </h1>
          <p className='text-slate-400 mt-1'>
            Here's how your books are performing
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
            <FiBook className='text-royal-blue' />
            <span className='text-xs text-slate-500'>Total</span>
          </div>
          <p className='text-2xl font-bold text-white'>{stats.total_books}</p>
          <p className='text-xs text-slate-400'>Books Published</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiDownload className='text-emerald' />
            <span className='text-xs text-slate-500'>Lifetime</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.total_downloads.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Downloads</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiDollarSign className='text-amber-500' />
            <span className='text-xs text-slate-500'>Revenue</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            ${stats.total_earnings.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Earnings</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiStar className='text-yellow-500' />
            <span className='text-xs text-slate-500'>Rating</span>
          </div>
          <p className='text-2xl font-bold text-white'>{stats.avg_rating}</p>
          <p className='text-xs text-slate-400'>Average Rating</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiTrendingUp className='text-emerald' />
            <span className='text-xs text-slate-500'>Monthly</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            ${stats.monthly_earnings.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Monthly Earnings</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiBook className='text-amber-500' />
            <span className='text-xs text-slate-500'>Drafts</span>
          </div>
          <p className='text-2xl font-bold text-white'>{stats.draft_books}</p>
          <p className='text-xs text-slate-400'>Draft Books</p>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-8 mb-8'>
        <div className='lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Downloads Overview
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
                dataKey='downloads'
                stroke='#2563EB'
                fill='#2563EB'
                fillOpacity={0.2}
                name='Downloads'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>Quick Stats</h3>
          <div className='space-y-4'>
            <div className='bg-gradient-to-r from-royal-blue/10 to-indigo/10 rounded-xl p-4 border border-royal-blue/20'>
              <p className='text-sm text-slate-400'>
                Average Downloads per Book
              </p>
              <p className='text-2xl font-bold text-white'>
                {stats.total_books > 0
                  ? Math.round(
                      stats.total_downloads / stats.total_books,
                    ).toLocaleString()
                  : 0}
              </p>
            </div>
            <div className='bg-gradient-to-r from-emerald/10 to-teal/10 rounded-xl p-4 border border-emerald/20'>
              <p className='text-sm text-slate-400'>Average Rating</p>
              <p className='text-2xl font-bold text-white'>
                {stats.avg_rating || 0} ★
              </p>
            </div>
            <div className='bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20'>
              <p className='text-sm text-slate-400'>Total Reviews</p>
              <p className='text-2xl font-bold text-white'>
                {stats.total_reviews}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid lg:grid-cols-2 gap-8'>
        <div>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold text-white'>Recent Books</h2>
            <Link
              to='/author/books'
              className='text-royal-blue text-sm flex items-center'
            >
              View all <FiArrowRight className='ml-1' />
            </Link>
          </div>
          <div className='space-y-3'>
            {recentBooks.map((book, index) => (
              <motion.div
                key={book.id}
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
                          book.status === 'published'
                            ? 'bg-emerald/20 text-emerald'
                            : 'bg-amber-500/20 text-amber-500'
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>
                    <h3 className='font-semibold text-white'>{book.title}</h3>
                    <div className='flex items-center gap-3 mt-2 text-xs text-slate-500'>
                      <span className='flex items-center gap-1'>
                        <FiDownload size={12} /> {book.downloads} downloads
                      </span>
                      <span className='flex items-center gap-1'>
                        <FiStar size={12} /> {book.rating || 0}
                      </span>
                      <span className='flex items-center gap-1'>
                        <FiTrendingUp size={12} />{' '}
                        {new Date(book.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/author/edit/${book.id}`}
                    className='text-royal-blue hover:text-indigo'
                  >
                    <FiEdit />
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
              to='/author/upload'
              className='bg-gradient-to-r from-royal-blue/10 to-indigo/10 rounded-xl p-6 border border-royal-blue/20 hover:border-royal-blue transition-all'
            >
              <FiUpload className='w-8 h-8 text-royal-blue mb-3' />
              <h3 className='font-semibold text-white mb-1'>Upload New Book</h3>
              <p className='text-slate-400 text-sm'>
                Share your knowledge with the world
              </p>
            </Link>

            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='font-semibold text-white mb-3'>Author Tips</h3>
              <div className='space-y-3'>
                <div className='flex gap-2'>
                  <FiAward className='text-royal-blue mt-1' />
                  <p className='text-sm text-slate-400'>
                    Books with covers get 3x more downloads
                  </p>
                </div>
                <div className='flex gap-2'>
                  <FiTrendingUp className='text-emerald mt-1' />
                  <p className='text-sm text-slate-400'>
                    Respond to reviews to build community
                  </p>
                </div>
                <div className='flex gap-2'>
                  <FiUsers className='text-indigo mt-1' />
                  <p className='text-sm text-slate-400'>
                    Promote your books on social media
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
