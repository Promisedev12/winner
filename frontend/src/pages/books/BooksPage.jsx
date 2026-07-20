import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiStar, FiDownload, FiBook } from 'react-icons/fi';
import publicService from '../../services/publicService';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [genres, setGenres] = useState(['All']);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, [pagination.current_page, selectedGenre, searchQuery, showPremiumOnly]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const filters = {
        status: 'published',
        category: selectedGenre !== 'All' ? selectedGenre : null,
        search: searchQuery || null,
        premium: showPremiumOnly ? 1 : null,
      };
      const response = await publicService.getBooks(
        pagination.current_page,
        filters,
      );
      if (response.success) {
        setBooks(response.data.books || []);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await publicService.getCategories();
      if (response.success) {
        const genreNames = ['All', ...response.data.map((c) => c.name)];
        setGenres(genreNames);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchBooks();
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
            E-Library <span className='gradient-text'>Collection</span>
          </h1>
          <p className='text-xl max-w-2xl mx-auto text-gray-200'>
            Discover thousands of books from independent authors and publishers
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
                  placeholder='Search books by title or author...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className='w-full pl-10 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
                />
              </div>

              <button
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                  showPremiumOnly
                    ? 'gradient-bg-main text-white'
                    : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <FiFilter /> Premium Only
              </button>
            </div>

            <div className='flex flex-wrap gap-2'>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    selectedGenre === genre
                      ? 'gradient-bg-main text-white'
                      : 'bg-slate-800 border border-slate-700 hover:border-royal-blue'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          {books.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-xl text-slate-400'>No books found</p>
            </div>
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='card group overflow-hidden'
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
                    {book.is_premium && (
                      <div className='absolute top-4 right-4'>
                        <span className='bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full'>
                          Premium
                        </span>
                      </div>
                    )}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                      <Link
                        to={`/book/${book.id}`}
                        className='btn-primary text-sm w-full text-center'
                      >
                        {book.is_premium ? 'Preview & Buy' : 'Read Now'}
                      </Link>
                    </div>
                  </div>
                  <div className='p-4'>
                    <h3 className='font-bold text-lg mb-1 line-clamp-1'>
                      {book.title}
                    </h3>
                    <p className='text-sm text-slate-500 mb-2'>
                      by {book.author_name}
                    </p>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <span className='text-emerald font-bold'>
                          {book.rating || 0}
                        </span>
                        <FiStar className='text-yellow-500 ml-1 fill-current' />
                        <span className='text-xs text-slate-500 ml-2'>
                          ({book.downloads || 0}+)
                        </span>
                      </div>
                      <span className='font-bold text-royal-blue'>
                        {book.price > 0 ? `$${book.price}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </motion.div>
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
