import { useState, useEffect, useContext } from 'react';
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
  BarChart,
  Bar,
} from 'recharts';
import {
  FiTrendingUp,
  FiDownload,
  FiEye,
  FiUsers,
  FiCalendar,
  FiStar,
  FiBook,
  FiRefreshCw,
} from 'react-icons/fi';
import authorService from '../../services/authService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(true);
  const [downloadsData, setDownloadsData] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await authorService.getAnalytics(timeRange);
      if (response.success) {
        setDownloadsData(response.data.downloads_data || []);
        setTopBooks(response.data.top_books || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification('Failed to fetch analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalDownloads: downloadsData.reduce(
      (acc, d) => acc + (d.downloads || 0),
      0,
    ),
    avgDownloads:
      downloadsData.length > 0
        ? Math.round(
            downloadsData.reduce((acc, d) => acc + (d.downloads || 0), 0) /
              downloadsData.length,
          )
        : 0,
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
            Analytics
          </h1>
          <p className='text-slate-400 mt-1'>Track your book performance</p>
        </div>
        <div className='flex gap-3'>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className='px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white'
          >
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

      <div className='grid md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiDownload className='w-5 h-5 text-royal-blue' />
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.totalDownloads.toLocaleString()}
          </p>
          <p className='text-sm text-slate-400'>Total Downloads</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiTrendingUp className='w-5 h-5 text-emerald' />
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.avgDownloads.toLocaleString()}
          </p>
          <p className='text-sm text-slate-400'>Avg Downloads/Book</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiStar className='w-5 h-5 text-yellow-500' />
          </div>
          <p className='text-2xl font-bold text-white'>
            {topBooks.reduce((acc, b) => acc + (b.rating || 0), 0) /
              (topBooks.length || 1)}
          </p>
          <p className='text-sm text-slate-400'>Avg Rating</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiBook className='w-5 h-5 text-indigo' />
          </div>
          <p className='text-2xl font-bold text-white'>{topBooks.length}</p>
          <p className='text-sm text-slate-400'>Top Books</p>
        </div>
      </div>

      <div className='bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Downloads Trend
        </h3>
        <ResponsiveContainer width='100%' height={350}>
          <AreaChart data={downloadsData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
            <XAxis dataKey='date' stroke='#94A3B8' />
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
        <h3 className='text-lg font-semibold text-white mb-4'>
          Top Performing Books
        </h3>
        <div className='space-y-4'>
          {topBooks.map((book, index) => (
            <div
              key={book.id}
              className='flex justify-between items-center p-4 bg-slate-700/30 rounded-lg'
            >
              <div>
                <p className='font-semibold text-white'>
                  #{index + 1} {book.title}
                </p>
                <div className='flex items-center gap-4 mt-1 text-sm text-slate-400'>
                  <span className='flex items-center gap-1'>
                    <FiDownload size={14} /> {book.downloads} downloads
                  </span>
                  <span className='flex items-center gap-1'>
                    <FiStar size={14} className='text-yellow-500' />{' '}
                    {book.rating || 0}
                  </span>
                  <span className='flex items-center gap-1'>
                    💰 ${book.price || 0}
                  </span>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-sm text-slate-400'>
                  {book.reviews_count || 0} reviews
                </p>
              </div>
            </div>
          ))}
          {topBooks.length === 0 && (
            <p className='text-slate-400 text-center py-8'>No books found</p>
          )}
        </div>
      </div>
    </div>
  );
}
