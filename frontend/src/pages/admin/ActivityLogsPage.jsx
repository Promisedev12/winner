import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUser,
  FiEye,
  FiDownload,
  FiActivity,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchLogs();
  }, [pagination.current_page, typeFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await adminService.getActivityLogs(
        pagination.current_page,
        20,
        { action: typeFilter !== 'all' ? typeFilter : null },
      );
      if (response.success) {
        setLogs(response.data.logs);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      showNotification('Failed to fetch activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchLogs();
  };

  const getTypeColor = (action) => {
    if (action.includes('login') || action.includes('logout'))
      return 'bg-royal-blue/20 text-royal-blue';
    if (action.includes('blog') || action.includes('post'))
      return 'bg-emerald/20 text-emerald';
    if (action.includes('user') || action.includes('role'))
      return 'bg-purple-500/20 text-purple-500';
    if (action.includes('comment')) return 'bg-amber-500/20 text-amber-500';
    return 'bg-slate-500/20 text-slate-400';
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
            Activity Logs
          </h1>
          <p className='text-slate-400 mt-1'>
            Track all system activity and user actions
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={fetchLogs}
            className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
          >
            <FiRefreshCw className='text-slate-400' />
          </button>
          <button className='btn-secondary text-sm py-2 px-4'>
            <FiDownload className='mr-2' /> Export Logs
          </button>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search logs...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            onClick={() => setTypeFilter('login')}
            className={`px-4 py-2 rounded-lg transition-all ${
              typeFilter === 'login'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Authentication
          </button>
          <button
            onClick={() => setTypeFilter('blog')}
            className={`px-4 py-2 rounded-lg transition-all ${
              typeFilter === 'blog'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setTypeFilter('user')}
            className={`px-4 py-2 rounded-lg transition-all ${
              typeFilter === 'user'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Admin
          </button>
        </div>
        <button
          onClick={handleSearch}
          className='px-4 py-2 bg-royal-blue rounded-lg hover:bg-indigo transition-colors'
        >
          Search
        </button>
      </div>

      <div className='bg-slate-800 rounded-xl border border-slate-700 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-slate-700/50 border-b border-slate-700'>
              <tr>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Timestamp
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  User
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Action
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Details
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='border-b border-slate-700 hover:bg-slate-700/30 transition-colors'
                >
                  <td className='px-4 py-3 text-sm text-slate-300'>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className='px-4 py-3 font-medium text-white'>
                    {log.user_name || 'System'}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getTypeColor(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-400'>
                    {log.details || '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-400'>
                    {log.ip_address || '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length === 0 && (
        <div className='text-center py-12'>
          <FiActivity className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No activity logs found</p>
        </div>
      )}

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
