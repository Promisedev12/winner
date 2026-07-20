import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiChevronRight,
  FiStar,
  FiUsers,
  FiBookOpen,
  FiCpu,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiGlobe,
  FiPenTool,
  FiDownloadCloud,
  FiMessageCircle,
} from 'react-icons/fi';
import publicService from '../../services/publicService';

export default function LandingPage() {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalBooks: 0,
    satisfactionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch featured blogs (published, latest)
      const blogsResponse = await publicService.getBlogs(1, {
        status: 'published',
        limit: 3,
      });

      // Fetch featured books (published, by downloads)
      const booksResponse = await publicService.getBooks(1, {
        status: 'published',
        limit: 4,
      });

      // Fetch stats
      const statsResponse = await publicService.getStats();

      // Fetch testimonials (if available)
      const testimonialsResponse = await publicService
        .getTestimonials()
        .catch(() => ({ success: false }));

      if (blogsResponse.success) {
        setFeaturedBlogs(blogsResponse.data.blogs || []);
      }

      if (booksResponse.success) {
        setFeaturedBooks(booksResponse.data.books || []);
      }

      if (statsResponse.success) {
        setStats({
          totalUsers: statsResponse.data.total_users || 0,
          totalBlogs: statsResponse.data.total_blogs || 0,
          totalBooks: statsResponse.data.total_books || 0,
          satisfactionRate: statsResponse.data.satisfaction_rate || 98,
        });
      }

      if (testimonialsResponse.success) {
        setTestimonials(testimonialsResponse.data || []);
      } else {
        // Fallback testimonials
        setTestimonials([
          {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Tech Blogger',
            avatar:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            content:
              'BlogLib has transformed how I create content. The AI writing assistant is a game-changer!',
            rating: 5,
          },
          {
            id: 2,
            name: 'Dr. Michael Lee',
            role: 'Published Author',
            avatar:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
            content:
              'The e-library system is incredible. My readers love the online reading experience.',
            rating: 5,
          },
          {
            id: 3,
            name: 'Emma Davis',
            role: 'Content Creator',
            avatar:
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
            content:
              'Best platform for writers and readers. The community is amazing and supportive.',
            rating: 5,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching landing page data:', error);
      // Use fallback data
      setFeaturedBlogs(fallbackBlogs);
      setFeaturedBooks(fallbackBooks);
      setStats({
        totalUsers: 24850,
        totalBlogs: 12450,
        totalBooks: 3450,
        satisfactionRate: 98,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fallback data in case API fails
  const fallbackBlogs = [
    {
      id: 1,
      title: 'The Future of AI in Content Creation',
      excerpt:
        'Discover how artificial intelligence is revolutionizing the way we create and consume content...',
      author: 'Sarah Johnson',
      author_avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      category: 'Technology',
      read_time: '5 min read',
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
      author_avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      category: 'Education',
      read_time: '8 min read',
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
      author_avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      category: 'Programming',
      read_time: '10 min read',
      image: 'https://images.unsplash.com/photo-1461749280691-d64ff3e2dc2c',
      likes: 892,
      comments: 123,
    },
  ];

  const fallbackBooks = [
    {
      id: 1,
      title: 'The Complete Python Guide',
      author: 'Dr. Emily Brown',
      cover_image:
        'https://images.unsplash.com/photo-1532012197267-da84d127e765',
      genre: 'Programming',
      rating: 4.8,
      downloads: 12500,
    },
    {
      id: 2,
      title: 'Digital Marketing Mastery',
      author: 'James Wilson',
      cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      genre: 'Marketing',
      rating: 4.6,
      downloads: 8900,
    },
    {
      id: 3,
      title: 'Data Science Essentials',
      author: 'Dr. Maria Garcia',
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      genre: 'Data Science',
      rating: 4.9,
      downloads: 15300,
    },
    {
      id: 4,
      title: 'UX Design Principles',
      author: 'Alex Thompson',
      cover_image:
        'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c',
      genre: 'Design',
      rating: 4.7,
      downloads: 6700,
    },
  ];

  const features = [
    {
      icon: <FiPenTool className='w-8 h-8' />,
      title: 'Professional Blogging',
      description:
        'Rich text editor, SEO tools, and analytics for serious content creators.',
      color: 'from-royal-blue to-indigo',
    },
    {
      icon: <FiBookOpen className='w-8 h-8' />,
      title: 'Smart E-Library',
      description:
        'Upload, read, and manage digital books with our advanced reader.',
      color: 'from-emerald to-teal',
    },
    {
      icon: <FiCpu className='w-8 h-8' />,
      title: 'AI Writing Assistant',
      description:
        'Generate, improve, and optimize content with AI-powered tools.',
      color: 'from-indigo to-purple',
    },
    {
      icon: <FiTrendingUp className='w-8 h-8' />,
      title: 'Smart Analytics',
      description:
        'Track engagement, audience insights, and content performance.',
      color: 'from-royal-blue to-cyan',
    },
    {
      icon: <FiShield className='w-8 h-8' />,
      title: 'Premium Security',
      description: 'Enterprise-grade security for your content and user data.',
      color: 'from-emerald to-blue',
    },
    {
      icon: <FiGlobe className='w-8 h-8' />,
      title: 'Global Community',
      description: 'Connect with readers and creators from around the world.',
      color: 'from-indigo to-royal-blue',
    },
  ];

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  return (
    <div className='font-sans antialiased'>
      {/* Hero Section */}
      <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-deep-navy via-royal-blue to-indigo'>
        <div className='absolute inset-0 opacity-20'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse'></div>
          <div className='absolute bottom-20 right-10 w-96 h-96 bg-emerald rounded-full blur-3xl animate-pulse delay-1000'></div>
        </div>

        <div className='relative max-w-7xl mx-auto px-6 lg:px-8 text-center py-20'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className='inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6'
            >
              <span className='text-white text-sm'>
                ✨ Welcome to the Future of Content
              </span>
            </motion.div>

            <h1 className='text-5xl md:text-7xl font-bold mb-6 leading-tight'>
              <span className='text-white'>Create, Read, and</span>
              <br />
              <span className='gradient-text'>Grow with AI</span>
            </h1>

            <p className='text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200'>
              The all-in-one platform for bloggers, authors, and readers.
              Publish your thoughts, share your books, and leverage AI to create
              amazing content.
            </p>

            <div className='flex flex-col sm:flex-row justify-center gap-4'>
              <Link
                to='/register'
                className='btn-primary text-lg px-8 py-4 bg-white text-deep-navy hover:bg-gray-100'
              >
                Start Your Journey <FiArrowRight className='ml-2' />
              </Link>
              <Link
                to='/blogs'
                className='btn-secondary text-lg px-8 py-4 border-white text-white hover:bg-white/10'
              >
                Explore Content <FiChevronRight className='ml-2' />
              </Link>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-20'>
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
                <div className='text-3xl mb-2 text-white'>📚</div>
                <div className='text-2xl md:text-3xl font-bold text-white'>
                  {stats.totalUsers.toLocaleString()}+
                </div>
                <div className='text-gray-300'>Active Readers</div>
              </div>
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
                <div className='text-3xl mb-2 text-white'>✍️</div>
                <div className='text-2xl md:text-3xl font-bold text-white'>
                  {stats.totalBlogs.toLocaleString()}+
                </div>
                <div className='text-gray-300'>Published Blogs</div>
              </div>
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
                <div className='text-3xl mb-2 text-white'>📖</div>
                <div className='text-2xl md:text-3xl font-bold text-white'>
                  {stats.totalBooks.toLocaleString()}+
                </div>
                <div className='text-gray-300'>Digital Books</div>
              </div>
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
                <div className='text-3xl mb-2 text-white'>⭐</div>
                <div className='text-2xl md:text-3xl font-bold text-white'>
                  {stats.satisfactionRate}%
                </div>
                <div className='text-gray-300'>Satisfaction Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className='section-padding bg-slate-900'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-16'
          >
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Powerful <span className='gradient-text'>Features</span> for
              Everyone
            </h2>
            <p className='text-xl text-slate-400 max-w-3xl mx-auto'>
              Everything you need to create, publish, and grow your audience in
              one place
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='card p-8'
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold mb-3'>{feature.title}</h3>
                <p className='text-slate-400'>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className='section-padding bg-slate-800'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='flex justify-between items-center mb-12'
          >
            <div>
              <h2 className='text-3xl md:text-4xl font-bold mb-2'>
                Featured <span className='gradient-text'>Blogs</span>
              </h2>
              <p className='text-slate-400'>
                Discover trending articles from top creators
              </p>
            </div>
            <Link
              to='/blogs'
              className='text-royal-blue hover:text-indigo font-semibold flex items-center'
            >
              View All <FiChevronRight className='ml-1' />
            </Link>
          </motion.div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {(featuredBlogs.length > 0 ? featuredBlogs : fallbackBlogs).map(
              (blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className='card overflow-hidden group'
                >
                  <div className='relative h-48 overflow-hidden'>
                    <img
                      src={
                        blog.image ||
                        blog.featured_image ||
                        'https://via.placeholder.com/800x400/1e293b/64748b?text=No+Image'
                      }
                      alt={blog.title}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                    <div className='absolute top-4 left-4'>
                      <span className='bg-royal-blue text-white text-sm px-3 py-1 rounded-full'>
                        {blog.category || blog.category_name || 'General'}
                      </span>
                    </div>
                  </div>
                  <div className='p-6'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <img
                        src={
                          blog.author_avatar || 'https://via.placeholder.com/40'
                        }
                        alt={blog.author || blog.author_name}
                        className='w-10 h-10 rounded-full object-cover'
                      />
                      <div>
                        <p className='font-semibold text-sm'>
                          {blog.author || blog.author_name}
                        </p>
                        <p className='text-xs text-slate-500'>
                          {blog.read_time || blog.read_time || '5 min read'}
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
                        <span>💬 {blog.comments || 0}</span>
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
              ),
            )}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className='section-padding bg-slate-900'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='flex justify-between items-center mb-12'
          >
            <div>
              <h2 className='text-3xl md:text-4xl font-bold mb-2'>
                Popular <span className='gradient-text'>Books</span>
              </h2>
              <p className='text-slate-400'>
                Best-selling digital books from our authors
              </p>
            </div>
            <Link
              to='/books'
              className='text-royal-blue hover:text-indigo font-semibold flex items-center'
            >
              View All <FiChevronRight className='ml-1' />
            </Link>
          </motion.div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {(featuredBooks.length > 0 ? featuredBooks : fallbackBooks).map(
              (book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className='card group'
                >
                  <div className='relative h-64 overflow-hidden'>
                    <img
                      src={
                        book.cover_image ||
                        'https://via.placeholder.com/400x600/1e293b/64748b?text=No+Cover'
                      }
                      alt={book.title}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                      <Link
                        to={`/book/${book.id}`}
                        className='btn-primary text-sm w-full text-center'
                      >
                        {book.price > 0 ? 'Preview & Buy' : 'Read Now'}
                      </Link>
                    </div>
                  </div>
                  <div className='p-4'>
                    <h3 className='font-bold text-lg mb-1 line-clamp-1'>
                      {book.title}
                    </h3>
                    <p className='text-sm text-slate-500 mb-2'>
                      by {book.author || book.author_name}
                    </p>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <span className='text-emerald font-bold'>
                          {book.rating || 0}
                        </span>
                        <span className='text-yellow-500 ml-1'>★</span>
                        <span className='text-xs text-slate-500 ml-2'>
                          ({book.downloads || 0}+)
                        </span>
                      </div>
                      <span className='text-xs px-2 py-1 bg-slate-700 rounded-full'>
                        {book.genre || book.category_name || 'General'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* AI Assistant Promo */}
      <section className='section-padding bg-gradient-to-r from-deep-navy via-royal-blue to-indigo text-white'>
        <div className='container-custom'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className='inline-flex items-center bg-white/20 rounded-full px-4 py-2 mb-6'>
                <FiCpu className='mr-2' />
                <span className='text-sm'>AI-Powered Writing Assistant</span>
              </div>
              <h2 className='text-3xl md:text-4xl font-bold mb-4'>
                Write Smarter with <br />
                <span className='gradient-text'>AI Assistance</span>
              </h2>
              <p className='text-lg text-gray-200 mb-6'>
                Our AI helps you generate ideas, improve your writing, and
                optimize for SEO. Whether you're a blogger or author, create
                better content faster.
              </p>
              <ul className='space-y-3 mb-8'>
                <li className='flex items-center'>
                  <FiStar className='text-emerald mr-2' /> AI Article Generation
                </li>
                <li className='flex items-center'>
                  <FiStar className='text-emerald mr-2' /> Grammar & Style
                  Checker
                </li>
                <li className='flex items-center'>
                  <FiStar className='text-emerald mr-2' /> SEO Optimization
                </li>
                <li className='flex items-center'>
                  <FiStar className='text-emerald mr-2' /> Title & Outline
                  Generator
                </li>
              </ul>
              <Link
                to='/register'
                className='btn-primary bg-white text-deep-navy hover:bg-gray-100'
              >
                Try AI Assistant Now <FiArrowRight className='ml-2' />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='relative'
            >
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
                <div className='flex items-center space-x-3 mb-4'>
                  <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                  <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm ml-2'>AI Assistant</span>
                </div>
                <div className='space-y-4'>
                  <div className='bg-royal-blue/20 rounded-lg p-3'>
                    <p className='text-sm'>
                      🤖 AI: How can I help you write today?
                    </p>
                  </div>
                  <div className='bg-white/10 rounded-lg p-3'>
                    <p className='text-sm'>
                      👤 Write a blog about "Future of Remote Work"
                    </p>
                  </div>
                  <div className='bg-royal-blue/20 rounded-lg p-3'>
                    <p className='text-sm'>
                      🤖 Generating blog post with SEO optimization...
                    </p>
                  </div>
                  <div className='bg-emerald/20 rounded-lg p-3 border border-emerald'>
                    <p className='text-sm'>
                      ✨ Blog generated! Title: "The Future of Remote Work:
                      Trends for 2025"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='section-padding bg-slate-800'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-12'
          >
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              What Our <span className='gradient-text'>Community</span> Says
            </h2>
            <p className='text-xl text-slate-400 max-w-3xl mx-auto'>
              Join thousands of satisfied creators and readers
            </p>
          </motion.div>

          <div className='max-w-4xl mx-auto'>
            {testimonials.length > 0 && (
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='card p-8 text-center'
              >
                <div className='flex justify-center mb-4'>
                  <div className='flex text-yellow-500'>
                    {[
                      ...Array(testimonials[activeTestimonial].rating || 5),
                    ].map((_, i) => (
                      <FiStar key={i} className='fill-current' />
                    ))}
                  </div>
                </div>
                <p className='text-lg md:text-xl text-slate-300 mb-6 italic'>
                  "{testimonials[activeTestimonial].content}"
                </p>
                <div className='flex items-center justify-center space-x-3'>
                  <img
                    src={
                      testimonials[activeTestimonial].avatar ||
                      'https://via.placeholder.com/48'
                    }
                    alt={testimonials[activeTestimonial].name}
                    className='w-12 h-12 rounded-full object-cover'
                  />
                  <div className='text-left'>
                    <p className='font-bold'>
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className='text-sm text-slate-500'>
                      {testimonials[activeTestimonial].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className='flex justify-center space-x-2 mt-6'>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeTestimonial === index
                      ? 'w-8 bg-royal-blue'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='section-padding bg-gradient-to-r from-deep-navy to-royal-blue text-white'>
        <div className='container-custom text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Ready to Start Your Journey?
            </h2>
            <p className='text-xl text-gray-200 mb-8 max-w-2xl mx-auto'>
              Join BlogLib today and become part of the fastest growing content
              platform
            </p>
            <div className='flex flex-col sm:flex-row justify-center gap-4'>
              <Link
                to='/register'
                className='btn-primary bg-white text-deep-navy hover:bg-gray-100 text-lg'
              >
                Get Started Free <FiArrowRight className='ml-2' />
              </Link>
              <Link
                to='/contact'
                className='btn-secondary border-white text-white hover:bg-white/10 text-lg'
              >
                Contact Sales <FiMessageCircle className='ml-2' />
              </Link>
            </div>
            <p className='text-sm text-gray-300 mt-6'>
              Free forever • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
