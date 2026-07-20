import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../lib/utils';

const BlogCard = ({ blog, featured = false }) => {
  return (
    <article
      className={`card-premium group ${featured ? 'lg:col-span-2 lg:flex lg:gap-6' : ''}`}
    >
      <Link to={`/blog/${blog.slug || blog.id}`}>
        <div
          className={`relative overflow-hidden rounded-xl ${featured ? 'lg:w-1/2' : ''}`}
        >
          <img
            src={blog.image}
            alt={blog.title}
            className='w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105'
          />
          <div className='absolute top-3 left-3'>
            <span className='badge-primary bg-white/90 backdrop-blur-sm'>
              {blog.category}
            </span>
          </div>
        </div>
      </Link>

      <div className={`mt-4 ${featured ? 'lg:w-1/2 lg:mt-0' : ''}`}>
        <div className='flex items-center gap-3 text-sm text-secondary mb-3'>
          <div className='flex items-center gap-2'>
            <img
              src={blog.author.avatar}
              alt={blog.author.name}
              className='w-6 h-6 rounded-full object-cover'
            />
            <span>{blog.author.name}</span>
          </div>
          <span>•</span>
          <span>{blog.readTime}</span>
          <span>•</span>
          <span>{formatTimeAgo(blog.date)}</span>
        </div>

        <Link to={`/blog/${blog.slug || blog.id}`}>
          <h3
            className={`font-bold hover:text-primary transition-colors mb-2 dark:text-white ${
              featured ? 'text-2xl md:text-3xl' : 'text-xl'
            }`}
          >
            {blog.title}
          </h3>
        </Link>

        <p className='text-secondary line-clamp-2 mb-4'>{blog.excerpt}</p>

        <div className='flex items-center gap-4 text-sm text-secondary'>
          <button className='flex items-center gap-1 hover:text-primary transition-colors'>
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
                d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
              />
            </svg>
            {blog.likes}
          </button>
          <button className='flex items-center gap-1 hover:text-primary transition-colors'>
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
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            {blog.comments}
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
