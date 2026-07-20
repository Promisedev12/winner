import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiCheck,
  FiX,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiCreditCard,
  FiMail,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchSubscriptions();
  }, [pagination.current_page]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSubscriptions(
        pagination.current_page,
      );
      if (response.success) {
        setSubscriptions(response.data.subscriptions);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      showNotification('Failed to fetch subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      const response = await adminService.cancelSubscription(subscriptionId);
      if (response.success) {
        showNotification('Subscription cancelled successfully', 'success');
        fetchSubscriptions();
      }
    } catch (error) {
      showNotification('Failed to cancel subscription', 'error');
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (
      searchQuery &&
      !sub.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    total: pagination.total,
    active: subscriptions.filter((s) => s.status === 'active').length,
    cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
    mrr: subscriptions
      .filter((s) => s.status === 'active')
      .reduce((acc, s) => acc + parseFloat(s.price), 0),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald/20 text-emerald';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500';
      case 'expired':
        return 'bg-amber-500/20 text-amber-500';
      case 'past_due':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-slate-500/20 text-slate-400';
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
            Subscriptions
          </h1>
          <p className='text-slate-400 mt-1'>
            Manage user subscriptions and plans
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='grid grid-cols-4 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Total Subscribers</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <p className='text-2xl font-bold text-emerald'>{stats.active}</p>
          <p className='text-sm text-slate-400'>Active</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <p className='text-2xl font-bold text-red-500'>{stats.cancelled}</p>
          <p className='text-sm text-slate-400'>Cancelled</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <p className='text-2xl font-bold text-emerald'>${stats.mrr}/mo</p>
          <p className='text-sm text-slate-400'>Monthly Recurring</p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search subscribers...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
          />
        </div>
      </div>

      <div className='bg-slate-800 rounded-xl border border-slate-700 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-slate-700/50 border-b border-slate-700'>
              <tr>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  User
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Plan
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Price
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Start Date
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  End Date
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub, index) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='border-b border-slate-700 hover:bg-slate-700/30 transition-colors'
                >
                  <td className='px-4 py-3'>
                    <div>
                      <p className='font-medium text-white'>{sub.user_name}</p>
                      <p className='text-xs text-slate-400'>{sub.user_email}</p>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-white capitalize'>
                    {sub.plan}
                  </td>
                  <td className='px-4 py-3 text-emerald font-semibold'>
                    ${sub.price}/mo
                  </td>
                  <td className='px-4 py-3 text-slate-300'>
                    {new Date(sub.start_date).toLocaleDateString()}
                  </td>
                  <td className='px-4 py-3 text-slate-300'>
                    {new Date(sub.end_date).toLocaleDateString()}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(sub.status)}`}
                    >
                      {sub.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2'>
                      <button className='p-1 hover:text-royal-blue transition-colors'>
                        <FiMail size={16} />
                      </button>
                      {sub.status === 'active' && (
                        <button
                          onClick={() => handleCancelSubscription(sub.id)}
                          className='p-1 hover:text-red-500 transition-colors'
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className='text-center py-12'>
          <FiCreditCard className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No subscriptions found</p>
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
