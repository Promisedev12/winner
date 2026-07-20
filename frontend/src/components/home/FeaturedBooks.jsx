import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../blog/BlogCard';
import publicService from '../../services/publicService';

const FeaturedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await publicService.getBooks(1, { limit: 3 });
        
        if (response.success && response.data) {
          setBooks(response.data.slice(0, 3));
        } else {
          setBooks(getDemoBooks());
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setBooks(getDemoBooks());
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const getDemoBooks = () => [
    {
      id: 1,
      title: 'The Art of Web Design',
      excerpt:
        'Master the principles of modern web design with this comprehensive guide to creating beautiful, functional websites...',
      image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=800',
      author: {
        name: 'John Designer',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      },
      category: 'Design',
      pages: 320,
      likes: 456,
      reviews: 78,
      date: '2024-01-20',
    },
    {
      id: 2,
      title: 'JavaScript Mastery: Advanced Concepts',
      excerpt:
        'Dive deep into advanced JavaScript concepts and become a proficient developer with practical examples...',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      author: {
        name: 'Code Master',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      },
      category: 'Programming',
      pages: 450,
      likes: 678,
      reviews: 145,
      date: '2024-01-18',
    },
    {
      id: 3,
      title: 'Digital Marketing in 2024',
      excerpt:
        'Learn the latest digital marketing strategies and tactics to grow your business in the modern digital landscape...',
      image: 'https://images.unsplash.com/photo-1460925895917-adbbb191c28f?w=800',
      author: {
        name: 'Marketing Pro',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      },
      category: 'Marketing',
      pages: 280,
      likes: 523,
      reviews: 95,
      date: '2024-01-12',
    },
  ];

  if (loading) {
    return (
      <section className='py-24 bg-background dark:bg-background-dark'>
        <div className='container-custom'>
          <div className='text-center'>
            <p className='text-slate-400'>Loading books...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='py-20 bg-background dark:bg-background-dark'>
      <div className='container-custom'>
        {/* Section Header */}
        <div className='flex justify-between items-end mb-12'>
          <div>
            <span className='badge-primary'>Latest Books</span>
            <h2 className='text-3xl md:text-4xl font-bold mt-2 dark:text-white'>
              Featured Books
            </h2>
            <p className='text-secondary mt-2'>
              Discover must-read books from top authors
            </p>
          </div>
          <Link
            to='/books'
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

        {/* Books Grid */}
        {error && (
          <div className='mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400'>
            <p>{error}</p>
          </div>
        )}

        {books.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {books.map((book) => (
              <BlogCard key={book.id} blog={book} />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <p className='text-slate-400'>No books available yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedBooks;