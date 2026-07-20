import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiFileText,
  FiEdit,
  FiTrash2,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiTrendingUp,
  FiPlus,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiRefreshCw,
} from 'react-icons/fi';
import bloggerService from '../../services/bloggerService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function PostsManagementPage() {
  const [posts, setPosts] = useState([]);
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
    fetchPosts();
  }, [pagination.current_page, statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await bloggerService.getPosts(
        pagination.current_page,
        statusFilter === 'all' ? null : statusFilter,
        searchQuery,
      );
      if (response.success) {
        setPosts(response.data.posts);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showNotification('Failed to fetch posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await bloggerService.deletePost(id);
        if (response.success) {
          showNotification('Post deleted successfully', 'success');
          fetchPosts();
        }
      } catch (error) {
        showNotification('Failed to delete post', 'error');
      }
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchPosts();
  };

  const stats = {
    total: pagination.total,
    published: posts.filter((p) => p.status === 'published').length,
    drafts: posts.filter((p) => p.status === 'draft').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    totalViews: posts.reduce((acc, p) => acc + (p.views || 0), 0),
    totalLikes: posts.reduce((acc, p) => acc + (p.likes || 0), 0),
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
      <div className='flex flex-wrap justify-between items-center gap-4 mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>
            My Posts
          </h1>
          <p className='text-slate-400 mt-1'>Manage all your blog posts</p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={fetchPosts}
            className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
          >
            <FiRefreshCw className='text-slate-400' />
          </button>
          <Link to='/blogger/create' className='btn-primary'>
            <FiPlus className='mr-2' /> Write New Post
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Total Posts</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-emerald'>{stats.published}</p>
          <p className='text-sm text-slate-400'>Published</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-amber-500'>{stats.drafts}</p>
          <p className='text-sm text-slate-400'>Drafts</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>
            {stats.totalViews.toLocaleString()}
          </p>
          <p className='text-sm text-slate-400'>Total Views</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-rose-500'>
            {stats.totalLikes.toLocaleString()}
          </p>
          <p className='text-sm text-slate-400'>Total Likes</p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search posts...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            onClick={() => setStatusFilter('draft')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'draft'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'scheduled'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Scheduled
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
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-royal-blue transition-all'
          >
            <div className='p-6'>
              <div className='flex flex-wrap justify-between items-start gap-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-xs px-2 py-0.5 rounded-full bg-royal-blue/20 text-royal-blue'>
                      {post.category_name || 'Uncategorized'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        post.status === 'published'
                          ? 'bg-emerald/20 text-emerald'
                          : post.status === 'scheduled'
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <h3 className='font-semibold text-white text-lg mb-2'>
                    {post.title}
                  </h3>
                  <p className='text-slate-400 text-sm mb-3 line-clamp-2'>
                    {post.excerpt}
                  </p>
                  <div className='flex flex-wrap gap-4 text-sm'>
                    <span className='flex items-center gap-1 text-slate-400'>
                      <FiEye size={14} /> {post.views || 0} views
                    </span>
                    <span className='flex items-center gap-1 text-slate-400'>
                      <FiHeart size={14} /> {post.likes || 0} likes
                    </span>
                    <span className='flex items-center gap-1 text-slate-400'>
                      <FiCalendar size={14} />{' '}
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Link
                    to={`/blog/${post.id}`}
                    className='p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-royal-blue transition-colors'
                  >
                    <FiEye size={18} />
                  </Link>
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
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className='text-center py-12'>
          <FiFileText className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No posts found</p>
          <Link
            to='/blogger/create'
            className='text-royal-blue text-sm mt-2 inline-block'
          >
            Write your first post →
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
