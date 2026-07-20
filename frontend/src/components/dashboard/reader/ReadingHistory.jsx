import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiSearch,
  FiEye,
  FiBookOpen,
  FiRefreshCw,
} from 'react-icons/fi';
import readerService from '../../services/readerService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchHistory();
  }, [pagination.current_page, filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await readerService.getReadingHistory(
        pagination.current_page,
        filter === 'all' ? null : filter,
      );
      if (response.success) {
        setHistory(response.data.history);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      showNotification('Failed to fetch reading history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchHistory();
  };

  const stats = {
    total: pagination.total,
    blogs: history.filter((h) => h.content_type === 'blog').length,
    books: history.filter((h) => h.content_type === 'book').length,
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
            Reading History
          </h1>
          <p className='text-slate-400 mt-1'>
            Track everything you've read and your progress
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Total Items Read</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-emerald'>{stats.books}</p>
          <p className='text-sm text-slate-400'>Books Read</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-royal-blue'>{stats.blogs}</p>
          <p className='text-sm text-slate-400'>Blogs Read</p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search by title or author...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
          />
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'all'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('blog')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'blog'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Blogs
          </button>
          <button
            onClick={() => setFilter('book')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'book'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Books
          </button>
        </div>
        <button
          onClick={handleSearch}
          className='px-4 py-2 bg-royal-blue rounded-lg hover:bg-indigo transition-colors'
        >
          Search
        </button>
      </div>

      <div className='space-y-4'>
        {history.length > 0 ? (
          history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-royal-blue transition-all'
            >
              <div className='flex gap-4'>
                <img
                  src={
                    item.image ||
                    'https://via.placeholder.com/64x80/1e293b/64748b?text=No+Image'
                  }
                  alt={item.title}
                  className='w-16 h-20 rounded-lg object-cover'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.content_type === 'book'
                          ? 'bg-royal-blue/20 text-royal-blue'
                          : 'bg-emerald/20 text-emerald'
                      }`}
                    >
                      {item.content_type === 'book' ? 'Book' : 'Blog'}
                    </span>
                    <span className='text-xs text-emerald'>✓ Read</span>
                  </div>
                  <h3 className='font-semibold text-white'>{item.title}</h3>
                  <p className='text-sm text-slate-400'>
                    by {item.author_name}
                  </p>
                  <div className='flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500'>
                    <span className='flex items-center gap-1'>
                      <FiCalendar size={12} /> Last read:{' '}
                      {new Date(item.last_read).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/${item.content_type === 'book' ? 'book' : 'blog'}/${item.content_type === 'book' ? item.book_id : item.blog_id}`}
                  className='self-center btn-secondary text-sm py-2 px-4'
                >
                  Read Again
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div className='text-center py-12'>
            <FiEye className='w-12 h-12 text-slate-600 mx-auto mb-3' />
            <p className='text-slate-400'>No reading history found</p>
            <Link
              to='/books'
              className='text-royal-blue text-sm mt-2 inline-block'
            >
              Browse books to start reading →
            </Link>
          </div>
        )}
      </div>

      {pagination.last_page > 1 && (
        <div className='flex justify-center gap-2 mt-6'>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                current_page: pagination.current_page - 1,
              })
            }
            disabled={pagination.current_page === 1}
            className='px-3 py-1 rounded bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors'
          >
            Previous
          </button>
          <span className='px-3 py-1 text-slate-400'>
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                current_page: pagination.current_page + 1,
              })
            }
            disabled={pagination.current_page === pagination.last_page}
            className='px-3 py-1 rounded bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
