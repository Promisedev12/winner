import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiUser,
  FiTag,
  FiSearch,
  FiGrid,
  FiList,
  FiEye,
  FiHeart,
} from 'react-icons/fi';
import publicService from '../../services/publicService';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['All']);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [pagination.current_page, selectedCategory, searchQuery]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const filters = {
        status: 'published',
        category: selectedCategory !== 'All' ? selectedCategory : null,
        search: searchQuery || null,
      };
      const response = await publicService.getBlogs(
        pagination.current_page,
        filters,
      );
      if (response.success) {
        setBlogs(response.data.blogs || []);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await publicService.getCategories();
      if (response.success) {
        const categoryNames = ['All', ...response.data.map((c) => c.name)];
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchBlogs();
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  return (
    <div className='bg-slate-900 min-h-screen'>
      {/* Hero Section */}
      <section className='relative py-16 bg-gradient-to-r from-deep-navy via-royal-blue to-indigo text-white'>
        <div className='container-custom text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>
            Explore <span className='gradient-text'>Blogs</span>
          </h1>
          <p className='text-xl max-w-2xl mx-auto text-gray-200'>
            Discover insights, tutorials, and stories from our community of
            writers
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className='section-padding'>
        <div className='container-custom'>
          {/* Search and Filters */}
          <div className='mb-8'>
            <div className='flex flex-col md:flex-row gap-4 mb-6'>
              <div className='relative flex-grow'>
                <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
                <input
                  type='text'
                  placeholder='Search blogs...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className='w-full pl-10 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
                />
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'gradient-bg-main text-white'
                      : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'gradient-bg-main text-white'
                      : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <FiList />
                </button>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    selectedCategory === cat
                      ? 'gradient-bg-main text-white'
                      : 'bg-slate-800 border border-slate-700 hover:border-royal-blue'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid/List */}
          {blogs.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-xl text-slate-400'>No blogs found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='card overflow-hidden group'
                >
                  <div className='relative h-48 overflow-hidden'>
                    <img
                      src={
                        blog.featured_image ||
                        'https://via.placeholder.com/800x400/1e293b/64748b?text=No+Image'
                      }
                      alt={blog.title}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                    <div className='absolute top-4 left-4'>
                      <span className='bg-royal-blue text-white text-sm px-3 py-1 rounded-full'>
                        {blog.category_name || 'General'}
                      </span>
                    </div>
                  </div>
                  <div className='p-6'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <img
                        src={
                          blog.author_avatar || 'https://via.placeholder.com/40'
                        }
                        alt={blog.author_name}
                        className='w-10 h-10 rounded-full object-cover'
                      />
                      <div>
                        <p className='font-semibold text-sm'>
                          {blog.author_name}
                        </p>
                        <p className='text-xs text-slate-500'>
                          {blog.read_time || '5 min read'}
                        </p>
                      </div>
                    </div>
                    <h3 className='text-xl font-bold mb-2 line-clamp-2 hover:text-royal-blue transition-colors'>
                      <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
                    </h3>
                    <p className='text-slate-400 mb-4 line-clamp-2'>
                      {blog.excerpt || blog.content?.substring(0, 150) + '...'}
                    </p>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4 text-sm text-slate-500'>
                        <span>❤️ {blog.likes || 0}</span>
                        <span>💬 {blog.comments_count || 0}</span>
                      </div>
                      <Link
                        to={`/blog/${blog.id}`}
                        className='text-royal-blue hover:text-indigo font-semibold'
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className='space-y-6'>
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='card p-6 flex gap-6 group'
                >
                  <img
                    src={
                      blog.featured_image ||
                      'https://via.placeholder.com/200x150/1e293b/64748b?text=No+Image'
                    }
                    alt={blog.title}
                    className='w-48 h-32 object-cover rounded-lg'
                  />
                  <div className='flex-grow'>
                    <div className='flex items-center space-x-4 text-sm text-slate-500 mb-2'>
                      <span className='bg-royal-blue text-white px-2 py-1 rounded-full text-xs'>
                        {blog.category_name || 'General'}
                      </span>
                      <span className='flex items-center gap-1'>
                        <FiCalendar size={12} />{' '}
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                      <span className='flex items-center gap-1'>
                        <FiUser size={12} /> {blog.author_name}
                      </span>
                    </div>
                    <h3 className='text-xl font-bold mb-2 hover:text-royal-blue transition-colors'>
                      <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
                    </h3>
                    <p className='text-slate-400 mb-3 line-clamp-2'>
                      {blog.excerpt || blog.content?.substring(0, 150) + '...'}
                    </p>
                    <Link
                      to={`/blog/${blog.id}`}
                      className='text-royal-blue hover:text-indigo font-semibold text-sm'
                    >
                      Read More →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className='flex justify-center gap-2 mt-8'>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    current_page: pagination.current_page - 1,
                  })
                }
                disabled={pagination.current_page === 1}
                className='px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors'
              >
                Previous
              </button>
              <span className='px-4 py-2 text-slate-400'>
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
                className='px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors'
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
