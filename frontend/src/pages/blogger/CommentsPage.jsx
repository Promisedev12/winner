import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiMessageCircle,
  FiThumbsUp,
  FiFlag,
  FiCheck,
  FiX,
  FiSearch,
  FiMail,
  FiRefreshCw,
} from 'react-icons/fi';
import bloggerService from '../../services/bloggerService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchComments();
  }, [pagination.current_page, statusFilter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await bloggerService.getComments(
        pagination.current_page,
        statusFilter === 'all' ? null : statusFilter,
      );
      if (response.success) {
        setComments(response.data.comments);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showNotification('Failed to fetch comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await bloggerService.approveComment(id);
      if (response.success) {
        showNotification('Comment approved', 'success');
        fetchComments();
      }
    } catch (error) {
      showNotification('Failed to approve comment', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await bloggerService.deleteComment(id);
        if (response.success) {
          showNotification('Comment deleted', 'success');
          fetchComments();
        }
      } catch (error) {
        showNotification('Failed to delete comment', 'error');
      }
    }
  };

  const stats = {
    total: pagination.total,
    pending: comments.filter((c) => c.status === 'pending').length,
    approved: comments.filter((c) => c.status === 'approved').length,
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
            Comments
          </h1>
          <p className='text-slate-400 mt-1'>
            Manage and respond to reader comments
          </p>
        </div>
        <button
          onClick={fetchComments}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Total Comments</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-emerald'>{stats.approved}</p>
          <p className='text-sm text-slate-400'>Approved</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-amber-500'>{stats.pending}</p>
          <p className='text-sm text-slate-400'>Pending</p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search comments...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
          />
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'approved'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'pending'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      <div className='space-y-4'>
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-slate-800 rounded-xl p-6 border border-slate-700'
          >
            <div className='flex gap-4'>
              <img
                src={comment.user_avatar || 'https://via.placeholder.com/48'}
                alt={comment.user_name}
                className='w-12 h-12 rounded-full'
              />
              <div className='flex-1'>
                <div className='flex flex-wrap justify-between items-start gap-2'>
                  <div>
                    <h3 className='font-semibold text-white'>
                      {comment.user_name}
                    </h3>
                    <p className='text-xs text-royal-blue'>
                      {comment.post_title}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        comment.status === 'approved'
                          ? 'bg-emerald/20 text-emerald'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}
                    >
                      {comment.status}
                    </span>
                    <span className='text-xs text-slate-500'>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className='text-slate-400 mt-3'>{comment.content}</p>
                <div className='flex items-center gap-4 mt-4'>
                  <button className='flex items-center gap-1 text-sm text-slate-400 hover:text-royal-blue transition-colors'>
                    <FiThumbsUp size={14} /> Like ({comment.likes || 0})
                  </button>
                  {comment.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className='flex items-center gap-1 text-sm text-slate-400 hover:text-emerald transition-colors'
                    >
                      <FiCheck size={14} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className='flex items-center gap-1 text-sm text-slate-400 hover:text-red-500 transition-colors'
                  >
                    <FiX size={14} /> Delete
                  </button>
                  <button className='flex items-center gap-1 text-sm text-slate-400 hover:text-royal-blue transition-colors'>
                    <FiMail size={14} /> Reply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className='text-center py-12'>
          <FiMessageCircle className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No comments found</p>
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
