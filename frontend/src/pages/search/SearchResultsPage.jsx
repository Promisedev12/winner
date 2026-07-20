import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import BlogCard from '../../components/blog/BlogCard';
import BookCard from '../../components/books/BookCard';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');

  const blogResults = [
    {
      id: 1,
      title: 'The Future of AI in Content Creation',
      excerpt:
        'Discover how artificial intelligence is revolutionizing the way we create and consume content...',
      image:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
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
  ];

  const bookResults = [
    {
      id: 1,
      title: 'The Art of Software Architecture',
      author: 'Robert Martin',
      cover:
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      genre: 'Technology',
      rating: 4.8,
      reviews: 1245,
      price: 29.99,
      isPremium: true,
    },
  ];

  return (
    <div className='min-h-screen py-20'>
      <div className='container-custom'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2 dark:text-white'>
            Search Results for "{query}"
          </h1>
          <p className='text-secondary'>
            Found {blogResults.length + bookResults.length} results
          </p>
        </div>

        {/* Tabs */}
        <div className='flex gap-4 border-b border-border dark:border-border-dark mb-8'>
          {['all', 'blogs', 'books'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Results */}
        {(activeTab === 'all' || activeTab === 'blogs') &&
          blogResults.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold mb-4 dark:text-white'>
                Blogs
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {blogResults.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </div>
          )}

        {(activeTab === 'all' || activeTab === 'books') &&
          bookResults.length > 0 && (
            <div>
              <h2 className='text-xl font-semibold mb-4 dark:text-white'>
                Books
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {bookResults.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

        {blogResults.length === 0 && bookResults.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-secondary text-lg'>
              No results found for "{query}"
            </p>
            <p className='text-secondary mt-2'>
              Try different keywords or browse our categories
            </p>
            <Link to='/blogs' className='btn-primary mt-6 inline-block'>
              Browse All Blogs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
