import React from 'react';
import { Link } from 'react-router-dom';

const topAuthors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    role: 'AI Researcher',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    followers: 12500,
    blogs: 45,
    books: 3,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Software Engineer',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    followers: 8900,
    blogs: 67,
    books: 1,
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Bestselling Author',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    followers: 23400,
    blogs: 23,
    books: 7,
  },
];

const TopAuthors = () => {
  return (
    <section className='py-24 bg-gradient-to-b from-white to-gray-50 dark:from-card-dark dark:to-background-dark'>
      <div className='container-custom'>
        <div className='text-center mb-16'>
          <span className='badge-primary inline-block mb-4'>Top Creators</span>
          <h2 className='text-4xl md:text-5xl font-bold mb-4 dark:text-white'>
            Meet Our Experts
          </h2>
          <p className='text-secondary text-lg max-w-2xl mx-auto'>
            Learn from the best content creators on the platform
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12'>
          {topAuthors.map((author) => (
            <div key={author.id} className='card-premium text-center group p-8'>
              <div className='relative inline-block mb-4'>
                <img
                  src={author.avatar}
                  alt={author.name}
                  className='w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary/20 group-hover:border-primary/50 transition-all duration-300'
                />
                <div className='absolute -top-2 -right-2 bg-success text-white text-xs rounded-full px-2 py-1'>
                  ✓ Verified
                </div>
              </div>

              <h3 className='text-2xl font-bold dark:text-white mb-2'>
                {author.name}
              </h3>
              <p className='text-primary font-medium mb-6'>{author.role}</p>

              <div className='flex justify-center gap-8 mb-8 py-4 border-y border-border dark:border-border-dark'>
                <div className='text-center'>
                  <div className='text-2xl font-bold dark:text-white'>
                    {author.followers.toLocaleString()}
                  </div>
                  <div className='text-sm text-secondary'>Followers</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold dark:text-white'>
                    {author.blogs}
                  </div>
                  <div className='text-sm text-secondary'>Blogs</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold dark:text-white'>
                    {author.books}
                  </div>
                  <div className='text-sm text-secondary'>Books</div>
                </div>
              </div>

              <Link
                to={`/profile/${author.name.toLowerCase().replace(/\s+/g, '-')}`}
                className='btn-outline w-full py-3'
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopAuthors;
