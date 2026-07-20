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
  FiHeart,
  FiFileText,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function BlogsModerationPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchBlogs();
  }, [pagination.current_page, statusFilter]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await adminService.getBlogs(
        pagination.current_page,
        statusFilter,
        searchQuery,
      );
      if (response.success) {
        setBlogs(response.data.blogs);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showNotification('Failed to fetch blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (blogId) => {
    try {
      const response = await adminService.moderateBlog(blogId, 'approve');
      if (response.success) {
        showNotification('Blog approved successfully', 'success');
        fetchBlogs();
      }
    } catch (error) {
      showNotification('Failed to approve blog', 'error');
    }
  };

  const handleReject = async (blogId) => {
    try {
      const response = await adminService.moderateBlog(blogId, 'reject');
      if (response.success) {
        showNotification('Blog rejected', 'success');
        fetchBlogs();
      }
    } catch (error) {
      showNotification('Failed to reject blog', 'error');
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchBlogs();
  };

  const stats = {
    total: pagination.total,
    pending: blogs.filter((b) => b.status === 'pending').length,
    published: blogs.filter((b) => b.status === 'published').length,
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
            Blogs Moderation
          </h1>
          <p className='text-slate-400 mt-1'>Review and moderate blog posts</p>
        </div>
        <button
          onClick={fetchBlogs}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Total Blogs</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-amber-500'>{stats.pending}</p>
          <p className='text-sm text-slate-400'>Pending Review</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-emerald'>{stats.published}</p>
          <p className='text-sm text-slate-400'>Published</p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search blogs...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
          />
        </div>
        <div className='flex gap-2'>
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
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'published'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Published
          </button>
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
        </div>
        <button
          onClick={handleSearch}
          className='px-4 py-2 bg-royal-blue rounded-lg hover:bg-indigo transition-colors'
        >
          Search
        </button>
      </div>

      <div className='space-y-4'>
        {blogs.map((blog, index) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-slate-800 rounded-xl p-6 border border-slate-700'
          >
            <div className='flex flex-wrap justify-between items-start gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xs px-2 py-0.5 rounded-full bg-royal-blue/20 text-royal-blue'>
                    {blog.category_name || 'Uncategorized'}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      blog.status === 'published'
                        ? 'bg-emerald/20 text-emerald'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  {blog.title}
                </h3>
                <div className='flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3'>
                  <span className='flex items-center gap-1'>
                    <FiUser size={14} /> {blog.author_name}
                  </span>
                  <span className='flex items-center gap-1'>
                    <FiCalendar size={14} />{' '}
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                  <span className='flex items-center gap-1'>
                    <FiEye size={14} /> {blog.views || 0} views
                  </span>
                  <span className='flex items-center gap-1'>
                    <FiHeart size={14} /> {blog.likes || 0} likes
                  </span>
                </div>
                <p className='text-slate-400 text-sm line-clamp-2'>
                  {blog.excerpt || blog.content?.substring(0, 150)}...
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => {
                    setSelectedBlog(blog);
                    setShowModal(true);
                  }}
                  className='p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-royal-blue transition-colors'
                >
                  <FiEye size={18} />
                </button>
                {blog.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(blog.id)}
                      className='p-2 rounded-lg bg-emerald/20 text-emerald hover:bg-emerald/30 transition-colors'
                    >
                      <FiCheck size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(blog.id)}
                      className='p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors'
                    >
                      <FiX size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className='text-center py-12'>
          <FiFileText className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No blogs found</p>
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

      {showModal && selectedBlog && (
        <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto'>
          <div className='bg-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center'>
              <h3 className='text-lg font-semibold text-white'>Blog Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className='p-1 rounded-lg hover:bg-slate-700'
              >
                <FiX size={20} className='text-slate-400' />
              </button>
            </div>
            <div className='p-6'>
              <h2 className='text-2xl font-bold text-white mb-4'>
                {selectedBlog.title}
              </h2>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 rounded-full bg-royal-blue/20 flex items-center justify-center text-royal-blue font-bold'>
                  {selectedBlog.author_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className='font-semibold text-white'>
                    {selectedBlog.author_name}
                  </p>
                  <p className='text-xs text-slate-400'>
                    Published:{' '}
                    {new Date(selectedBlog.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className='flex gap-4 mb-4 p-3 bg-slate-700/30 rounded-lg'>
                <div className='text-center'>
                  <p className='text-xl font-bold text-white'>
                    {selectedBlog.views || 0}
                  </p>
                  <p className='text-xs text-slate-400'>Views</p>
                </div>
                <div className='text-center'>
                  <p className='text-xl font-bold text-white'>
                    {selectedBlog.likes || 0}
                  </p>
                  <p className='text-xs text-slate-400'>Likes</p>
                </div>
                <div className='text-center'>
                  <p className='text-xl font-bold text-white'>
                    {selectedBlog.comments_count || 0}
                  </p>
                  <p className='text-xs text-slate-400'>Comments</p>
                </div>
              </div>
              <div className='prose prose-invert max-w-none'>
                <div
                  className='text-slate-300 whitespace-pre-wrap'
                  dangerouslySetInnerHTML={{
                    __html: selectedBlog.content || selectedBlog.excerpt,
                  }}
                />
              </div>
              <div className='flex gap-3 mt-6'>
                {selectedBlog.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedBlog.id);
                        setShowModal(false);
                      }}
                      className='flex-1 bg-emerald/20 text-emerald py-2 rounded-lg hover:bg-emerald/30'
                    >
                      Approve Blog
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedBlog.id);
                        setShowModal(false);
                      }}
                      className='flex-1 bg-red-500/20 text-red-500 py-2 rounded-lg hover:bg-red-500/30'
                    >
                      Reject Blog
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
