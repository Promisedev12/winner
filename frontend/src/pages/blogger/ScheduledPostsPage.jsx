import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiEdit,
  FiTrash2,
  FiSend,
  FiRefreshCw,
} from 'react-icons/fi';
import bloggerService from '../../services/bloggerService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function ScheduledPostsPage() {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchScheduledPosts();
  }, [pagination.current_page]);

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const response = await bloggerService.getScheduledPosts(
        pagination.current_page,
      );
      if (response.success) {
        setScheduledPosts(response.data.scheduled);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      showNotification('Failed to fetch scheduled posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async (id) => {
    try {
      const response = await bloggerService.publishScheduled(id);
      if (response.success) {
        showNotification('Post published successfully!', 'success');
        fetchScheduledPosts();
      }
    } catch (error) {
      showNotification('Failed to publish post', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm('Are you sure you want to delete this scheduled post?')
    ) {
      try {
        const response = await bloggerService.deletePost(id);
        if (response.success) {
          showNotification('Post deleted', 'success');
          fetchScheduledPosts();
        }
      } catch (error) {
        showNotification('Failed to delete post', 'error');
      }
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
            Scheduled Posts
          </h1>
          <p className='text-slate-400 mt-1'>
            Posts scheduled for future publication
          </p>
        </div>
        <button
          onClick={fetchScheduledPosts}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 mb-8'>
        <div className='flex justify-between items-center'>
          <div>
            <p className='text-2xl font-bold text-white'>{pagination.total}</p>
            <p className='text-sm text-slate-400'>Upcoming Posts</p>
          </div>
          <Link to='/blogger/create' className='btn-primary text-sm'>
            Schedule New Post
          </Link>
        </div>
      </div>

      <div className='space-y-4'>
        {scheduledPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className='bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-royal-blue transition-all'
          >
            <div className='flex flex-wrap justify-between items-start gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xs px-2 py-0.5 rounded-full bg-royal-blue/20 text-royal-blue'>
                    {post.category_name || 'Uncategorized'}
                  </span>
                  <span className='text-xs text-emerald flex items-center gap-1'>
                    <FiCalendar size={12} /> Scheduled for{' '}
                    {post.scheduled_for
                      ? new Date(post.scheduled_for).toLocaleString()
                      : 'Not set'}
                  </span>
                </div>
                <h3 className='font-semibold text-white text-lg mb-2'>
                  {post.title}
                </h3>
                <p className='text-slate-400 text-sm mb-3 line-clamp-2'>
                  {post.excerpt}
                </p>
                <div className='flex items-center gap-3 text-xs text-slate-500'>
                  <span className='flex items-center gap-1'>
                    <FiClock size={12} /> Created:{' '}
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => handlePublishNow(post.id)}
                  className='btn-primary text-sm py-2 px-4'
                >
                  <FiSend className='mr-2' /> Publish Now
                </button>
                <Link
                  to={`/blogger/edit/${post.id}`}
                  className='p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-royal-blue transition-colors'
                >
                  <FiEdit size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className='p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-red-500 transition-colors'
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {scheduledPosts.length === 0 && (
        <div className='text-center py-12'>
          <FiCalendar className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No scheduled posts</p>
          <Link
            to='/blogger/create'
            className='text-royal-blue text-sm mt-2 inline-block'
          >
            Schedule a post →
          </Link>
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
