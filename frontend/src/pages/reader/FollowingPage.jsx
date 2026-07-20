import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUserPlus,
  FiUserCheck,
  FiMail,
  FiBookOpen,
  FiUsers,
  FiRefreshCw,
} from 'react-icons/fi';
import readerService from '../../services/readerService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function FollowingPage() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchFollowing();
  }, [pagination.current_page]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const response = await readerService.getFollowing(
        pagination.current_page,
      );
      if (response.success) {
        setFollowing(response.data.following);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      showNotification('Failed to fetch following', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const response = await readerService.unfollowUser(userId);
      if (response.success) {
        showNotification('Unfollowed successfully', 'success');
        fetchFollowing();
      }
    } catch (error) {
      showNotification('Failed to unfollow user', 'error');
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
            Following
          </h1>
          <p className='text-slate-400 mt-1'>
            Connect with creators and follow their content
          </p>
        </div>
        <button
          onClick={fetchFollowing}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='flex gap-4 mb-8 border-b border-slate-800'>
        <button
          onClick={() => setActiveTab('following')}
          className={`pb-3 px-4 font-medium transition-all ${
            activeTab === 'following'
              ? 'text-royal-blue border-b-2 border-royal-blue'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Following ({pagination.total})
        </button>
        <button
          onClick={() => setActiveTab('suggested')}
          className={`pb-3 px-4 font-medium transition-all ${
            activeTab === 'suggested'
              ? 'text-royal-blue border-b-2 border-royal-blue'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Suggested
        </button>
      </div>

      {activeTab === 'following' && (
        <div className='space-y-4'>
          {following.length > 0 ? (
            following.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='bg-slate-800 rounded-xl p-6 border border-slate-700'
              >
                <div className='flex flex-col sm:flex-row gap-6'>
                  <img
                    src={creator.avatar || 'https://via.placeholder.com/80'}
                    alt={creator.name}
                    className='w-20 h-20 rounded-full object-cover'
                  />
                  <div className='flex-1'>
                    <div className='flex flex-wrap justify-between items-start gap-4'>
                      <div>
                        <h3 className='text-xl font-semibold text-white'>
                          {creator.name}
                        </h3>
                        <p className='text-royal-blue text-sm'>
                          {creator.bio || 'Content Creator'}
                        </p>
                        <p className='text-slate-400 text-sm mt-2 max-w-md'>
                          {creator.bio}
                        </p>
                        <div className='flex gap-4 mt-3 text-sm text-slate-500'>
                          <span className='flex items-center gap-1'>
                            <FiUsers size={14} /> {creator.followers_count || 0}{' '}
                            followers
                          </span>
                          <span className='flex items-center gap-1'>
                            <FiBookOpen size={14} /> {creator.posts_count || 0}{' '}
                            posts
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <button className='btn-secondary text-sm py-2 px-4'>
                          <FiMail className='mr-2' /> Message
                        </button>
                        <button
                          onClick={() => handleUnfollow(creator.id)}
                          className='px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-all text-sm'
                        >
                          Unfollow
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className='text-center py-12'>
              <FiUsers className='w-12 h-12 text-slate-600 mx-auto mb-3' />
              <p className='text-slate-400'>You're not following anyone yet</p>
              <Link
                to='/blogs'
                className='text-royal-blue text-sm mt-2 inline-block'
              >
                Discover creators to follow →
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'suggested' && (
        <div className='grid md:grid-cols-2 gap-6'>
          {/* Suggested creators - You can fetch these from an API */}
          <div className='text-center py-12 col-span-2'>
            <p className='text-slate-400'>Suggested creators coming soon...</p>
          </div>
        </div>
      )}

      {pagination.last_page > 1 && activeTab === 'following' && (
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
