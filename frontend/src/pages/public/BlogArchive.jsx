import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiUser,
  FiTag,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

// Mock blog posts data
const allBlogs = [
  {
    id: 1,
    title: 'The Future of AI in Content Creation',
    excerpt:
      'Explore how artificial intelligence is revolutionizing the way we create and consume content...',
    content: 'Full content here...',
    author: 'Sarah Johnson',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    date: '2024-12-15',
    category: 'Technology',
    tags: ['AI', 'Content Creation', 'Future Tech'],
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    likes: 234,
    comments: 45,
  },
  {
    id: 2,
    title: '10 Books Every Developer Should Read',
    excerpt:
      'Essential reading list for software engineers looking to level up their skills...',
    author: 'Michael Chen',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    date: '2024-12-10',
    category: 'Education',
    tags: ['Books', 'Programming', 'Learning'],
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66',
    likes: 567,
    comments: 89,
  },
  {
    id: 3,
    title: 'Building Scalable Web Applications',
    excerpt:
      'Best practices and architectural patterns for modern web development...',
    author: 'David Kim',
    authorAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    date: '2024-12-05',
    category: 'Programming',
    tags: ['Web Development', 'Scalability', 'Architecture'],
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1461749280691-d64ff3e2dc2c',
    likes: 892,
    comments: 123,
  },
  {
    id: 4,
    title: 'Digital Marketing Trends 2025',
    excerpt: 'Stay ahead with these emerging digital marketing strategies...',
    author: 'Emma Watson',
    authorAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    date: '2024-11-28',
    category: 'Marketing',
    tags: ['Marketing', 'Trends', 'Digital'],
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    likes: 445,
    comments: 67,
  },
  {
    id: 5,
    title: 'The Psychology of User Experience',
    excerpt: 'Understanding user behavior to create better digital products...',
    author: 'Dr. James Wilson',
    authorAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    date: '2024-11-20',
    category: 'Design',
    tags: ['UX', 'Psychology', 'Design'],
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c',
    likes: 678,
    comments: 91,
  },
  {
    id: 6,
    title: 'Machine Learning for Beginners',
    excerpt:
      'A gentle introduction to machine learning concepts and applications...',
    author: 'Dr. Maria Garcia',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    date: '2024-11-15',
    category: 'Technology',
    tags: ['Machine Learning', 'AI', 'Beginners'],
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    likes: 1234,
    comments: 234,
  },
];

const categories = [
  'All',
  'Technology',
  'Education',
  'Programming',
  'Marketing',
  'Design',
];
const sortOptions = ['Latest', 'Most Popular', 'Oldest'];

export default function BlogArchive() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const filteredBlogs = allBlogs
    .filter(
      (blog) =>
        (selectedCategory === 'All' || blog.category === selectedCategory) &&
        (blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          )),
    )
    .sort((a, b) => {
      if (sortBy === 'Latest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'Most Popular') return b.likes - a.likes;
      return 0;
    });

  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);
  const currentBlogs = filteredBlogs.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  return (
    <div className='font-sans antialiased'>
      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-r from-deep-navy via-royal-blue to-indigo text-white overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-20 right-10 w-96 h-96 bg-emerald rounded-full blur-3xl'></div>
        </div>
        <div className='container-custom relative text-center'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>
              Blog <span className='gradient-text'>Archive</span>
            </h1>
            <p className='text-xl max-w-2xl mx-auto text-gray-200'>
              Discover insights, tutorials, and stories from our community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Archive Content */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom'>
          {/* Search and Filters */}
          <div className='mb-12'>
            <div className='grid md:grid-cols-3 gap-4 mb-6'>
              <div className='relative'>
                <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search blogs...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-royal-blue focus:outline-none'
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='px-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-royal-blue focus:outline-none'
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='px-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-royal-blue focus:outline-none'
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Blog Grid */}
          {currentBlogs.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-xl text-dark-text/70 dark:text-gray-400'>
                No blogs found matching your criteria.
              </p>
            </div>
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {currentBlogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='card overflow-hidden group'
                >
                  <div className='relative h-48 overflow-hidden'>
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                    <div className='absolute top-4 left-4'>
                      <span className='bg-royal-blue text-white text-sm px-3 py-1 rounded-full'>
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <div className='p-6'>
                    <div className='flex items-center space-x-4 text-sm text-dark-text/50 dark:text-gray-500 mb-3'>
                      <span className='flex items-center'>
                        <FiCalendar className='mr-1' />{' '}
                        {new Date(blog.date).toLocaleDateString()}
                      </span>
                      <span className='flex items-center'>
                        <FiUser className='mr-1' /> {blog.author}
                      </span>
                    </div>
                    <h3 className='text-xl font-bold mb-2 line-clamp-2'>
                      <Link
                        to={`/blog/${blog.id}`}
                        className='hover:text-royal-blue transition-colors'
                      >
                        {blog.title}
                      </Link>
                    </h3>
                    <p className='text-dark-text/70 dark:text-gray-400 mb-4 line-clamp-3'>
                      {blog.excerpt}
                    </p>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        {blog.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className='text-xs px-2 py-1 bg-soft-gray dark:bg-gray-700 rounded-full flex items-center'
                          >
                            <FiTag className='mr-1 text-xs' /> {tag}
                          </span>
                        ))}
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center space-x-2 mt-12'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='p-2 rounded-lg border border-soft-gray dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-soft-gray dark:hover:bg-gray-800 transition-colors'
              >
                <FiChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentPage === i + 1
                      ? 'gradient-bg-main text-white'
                      : 'border border-soft-gray dark:border-gray-700 hover:bg-soft-gray dark:hover:bg-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className='p-2 rounded-lg border border-soft-gray dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-soft-gray dark:hover:bg-gray-800 transition-colors'
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className='section-padding bg-gradient-to-r from-deep-navy to-royal-blue text-white'>
        <div className='container-custom text-center'>
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>
            Never Miss a Post
          </h2>
          <p className='text-xl text-gray-200 mb-8 max-w-2xl mx-auto'>
            Subscribe to our newsletter and get the latest blogs delivered to
            your inbox
          </p>
          <div className='flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto'>
            <input
              type='email'
              placeholder='Enter your email'
              className='flex-grow px-4 py-3 rounded-lg text-dark-text'
            />
            <button className='btn-primary bg-white text-deep-navy hover:bg-gray-100'>
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
