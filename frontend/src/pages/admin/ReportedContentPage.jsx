import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiFlag,
  FiCalendar,
  FiUser,
  FiMessageCircle,
  FiBook,
  FiFileText,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function ReportedContentPage() {
  const [reportedItems, setReportedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchReportedContent();
  }, [typeFilter]);

  const fetchReportedContent = async () => {
    setLoading(true);
    try {
      const type = typeFilter === 'all' ? null : typeFilter;
      const response = await adminService.getReportedContent(type);
      if (response.success) {
        setReportedItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching reported content:', error);
      showNotification('Failed to fetch reported content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    // In a real implementation, you would call an API to resolve the report
    showNotification('Report resolved', 'success');
    fetchReportedContent();
  };

  const handleDismiss = async (id) => {
    // In a real implementation, you would call an API to dismiss the report
    showNotification('Report dismissed', 'success');
    fetchReportedContent();
  };

  const filteredItems = reportedItems.filter((item) => {
    if (
      searchQuery &&
      !item.content_title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    total: reportedItems.length,
    blogs: reportedItems.filter((i) => i.content_type === 'blog').length,
    books: reportedItems.filter((i) => i.content_type === 'book').length,
    comments: reportedItems.filter((i) => i.content_type === 'comment').length,
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'blog':
        return <FiFileText className='text-royal-blue' />;
      case 'book':
        return <FiBook className='text-emerald' />;
      case 'comment':
        return <FiMessageCircle className='text-amber-500' />;
      default:
        return <FiFlag />;
    }
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
            Reported Content
          </h1>
          <p className='text-slate-400 mt-1'>Review and handle user reports</p>
        </div>
        <button
          onClick={fetchReportedContent}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='grid grid-cols-4 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Total Reports</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-royal-blue'>{stats.blogs}</p>
          <p className='text-sm text-slate-400'>Blog Reports</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-emerald'>{stats.books}</p>
          <p className='text-sm text-slate-400'>Book Reports</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-amber-500'>{stats.comments}</p>
          <p className='text-sm text-slate-400'>Comment Reports</p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search reported content...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
          />
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              typeFilter === 'all'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('blog')}
            className={`px-4 py-2 rounded-lg transition-all ${
              typeFilter === 'blog'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Blogs
          </button>
          <button
            onClick={() => setTypeFilter('book')}
            className={`px-4 py-2 rounded-lg transition-all ${
              typeFilter === 'book'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setTypeFilter('comment')}
            className={`px-4 py-2 rounded-lg transition-all ${
              typeFilter === 'comment'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Comments
          </button>
        </div>
      </div>

      <div className='space-y-4'>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-slate-800 rounded-xl p-6 border border-red-500/30'
          >
            <div className='flex flex-wrap justify-between items-start gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  {getTypeIcon(item.content_type)}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.content_type === 'blog'
                        ? 'bg-royal-blue/20 text-royal-blue'
                        : item.content_type === 'book'
                          ? 'bg-emerald/20 text-emerald'
                          : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    {item.content_type?.charAt(0).toUpperCase() +
                      item.content_type?.slice(1)}
                  </span>
                  <span className='text-xs text-red-500 flex items-center gap-1'>
                    <FiFlag size={10} /> Reported: {item.reason}
                  </span>
                </div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  {item.content_title || 'Content'}
                </h3>
                <div className='flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3'>
                  <span className='flex items-center gap-1'>
                    <FiUser size={14} /> Reported by: {item.reporter_name}
                  </span>
                  <span className='flex items-center gap-1'>
                    <FiCalendar size={14} />{' '}
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {item.description && (
                  <div className='bg-red-500/10 rounded-lg p-3 border border-red-500/20'>
                    <p className='text-sm text-red-400 font-semibold mb-1'>
                      Report Description:
                    </p>
                    <p className='text-sm text-slate-300'>{item.description}</p>
                  </div>
                )}
              </div>
              <div className='flex gap-2'>
                <button className='p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-royal-blue transition-colors'>
                  <FiEye size={18} />
                </button>
                <button
                  onClick={() => handleResolve(item.id)}
                  className='px-4 py-2 bg-emerald/20 text-emerald rounded-lg hover:bg-emerald/30 transition-colors flex items-center gap-1'
                >
                  <FiCheck size={16} /> Remove Content
                </button>
                <button
                  onClick={() => handleDismiss(item.id)}
                  className='px-4 py-2 bg-royal-blue/20 text-royal-blue rounded-lg hover:bg-royal-blue/30 transition-colors flex items-center gap-1'
                >
                  <FiX size={16} /> Dismiss Report
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className='text-center py-12'>
          <FiFlag className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No reported content</p>
        </div>
      )}
    </div>
  );
}
