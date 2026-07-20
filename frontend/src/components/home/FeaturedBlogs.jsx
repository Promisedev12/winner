import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../blog/BlogCard';
import publicService from '../../services/publicService';

const FeaturedBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await publicService.getBlogs(1, { limit: 3 });
        
        if (response.success && response.data) {
          setBlogs(response.data.slice(0, 3));
        } else {
          setBlogs(getDemoBlogs());
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setBlogs(getDemoBlogs());
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const getDemoBlogs = () => [
    {
      id: 1,
      title: 'The Future of AI in Content Creation',
      excerpt:
        'Discover how artificial intelligence is revolutionizing the way we create and consume content...',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      author: {
        name: 'Sarah Johnson',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      },
      category: 'Technology',
      readTime: '5 min read',
      likes: 234,
      comments: 45,
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Mastering React: A Complete Guide',
      excerpt:
        'Learn React from scratch with practical examples and best practices for building modern web apps...',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      author: {
        name: 'Michael Chen',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      },
      category: 'Programming',
      readTime: '8 min read',
      likes: 567,
      comments: 89,
      date: '2024-01-10',
    },
    {
      id: 3,
      title: '10 Productivity Hacks for Writers',
      excerpt:
        'Boost your writing productivity with these proven techniques used by professional authors...',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
      author: {
        name: 'Emma Watson',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      },
      category: 'Writing',
      readTime: '4 min read',
      likes: 345,
      comments: 67,
      date: '2024-01-05',
    },
  ];

  if (loading) {
    return (
      <section className='py-24 bg-background dark:bg-background-dark'>
        <div className='container-custom'>
          <div className='text-center'>
            <p className='text-slate-400'>Loading articles...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='py-24 bg-background dark:bg-background-dark'>
      <div className='container-custom'>
        {/* Section Header */}
        <div className='flex justify-between items-end mb-12'>
          <div>
            <span className='badge-primary'>Latest Articles</span>
            <h2 className='text-3xl md:text-4xl font-bold mt-3 dark:text-white'>
              Featured Blogs
            </h2>
            <p className='text-secondary mt-2'>
              Discover trending articles from top creators
            </p>
          </div>
          <Link
            to='/blogs'
            className='text-primary hover:text-primary-dark font-semibold flex items-center gap-2'
          >
            View All
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </Link>
        </div>

        {/* Blogs Grid */}
        {error && (
          <div className='mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400'>
            <p>{error}</p>
          </div>
        )}

        {blogs.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <p className='text-slate-400'>No articles available yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedBlogs;