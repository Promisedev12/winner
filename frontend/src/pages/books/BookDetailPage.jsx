import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiStar,
  FiDownload,
  FiBookOpen,
  FiHeart,
  FiShare2,
  FiArrowLeft,
  FiUser,
} from 'react-icons/fi';
import publicService from '../../services/publicService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchBookData();
  }, [id]);

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const response = await publicService.getBook(id);
      if (response.success) {
        setBook(response.data);
        // In a real implementation, you'd fetch reviews separately
        setReviews([
          {
            id: 1,
            user_name: 'John Smith',
            rating: 5,
            created_at: '2024-11-15',
            content: 'Excellent book! Clear explanations and great examples.',
          },
          {
            id: 2,
            user_name: 'Sarah Johnson',
            rating: 4,
            created_at: '2024-11-10',
            content:
              'Very comprehensive. A bit dense for beginners but perfect for intermediate learners.',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!isAuthenticated) {
      showNotification('Please login to download this book', 'warning');
      return;
    }
    showNotification('Download started!', 'success');
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className='container-custom py-12 text-center'>
        <h1 className='text-2xl font-bold text-white'>Book not found</h1>
        <Link to='/books' className='text-royal-blue mt-4 inline-block'>
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className='bg-slate-900 min-h-screen'>
      <div className='container-custom pt-6'>
        <Link
          to='/books'
          className='inline-flex items-center text-royal-blue hover:text-indigo transition-colors'
        >
          <FiArrowLeft className='mr-2' /> Back to Books
        </Link>
      </div>

      <section className='py-12'>
        <div className='container-custom'>
          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Book Cover */}
            <div className='lg:col-span-1'>
              <div className='sticky top-24'>
                <img
                  src={
                    book.cover_image ||
                    'https://via.placeholder.com/400x600/1e293b/64748b?text=No+Cover'
                  }
                  alt={book.title}
                  className='w-full rounded-2xl shadow-2xl'
                />
                <div className='flex gap-3 mt-6'>
                  <button
                    onClick={handleDownload}
                    className='btn-primary flex-1 justify-center'
                  >
                    {book.is_premium ? (
                      <>
                        <FiDownload className='mr-2' /> Buy ${book.price}
                      </>
                    ) : (
                      <>
                        <FiBookOpen className='mr-2' /> Read Free
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`p-4 rounded-lg border transition-all ${
                      liked
                        ? 'bg-red-500/10 border-red-500 text-red-500'
                        : 'border-slate-700 hover:border-red-500'
                    }`}
                  >
                    <FiHeart className={liked ? 'fill-current' : ''} />
                  </button>
                  <button className='p-4 rounded-lg border border-slate-700 hover:border-royal-blue transition-all'>
                    <FiShare2 />
                  </button>
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className='lg:col-span-2'>
              <div className='flex items-center gap-2 mb-4'>
                <span className='px-3 py-1 bg-royal-blue/10 text-royal-blue rounded-full text-sm'>
                  {book.category_name || 'General'}
                </span>
                {book.is_premium && (
                  <span className='px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-sm'>
                    Premium
                  </span>
                )}
              </div>

              <h1 className='text-3xl md:text-4xl font-bold mb-2'>
                {book.title}
              </h1>
              {book.subtitle && (
                <p className='text-xl text-slate-400 mb-4'>{book.subtitle}</p>
              )}
              <p className='text-lg text-slate-400 mb-4'>
                by {book.author_name}
              </p>

              <div className='flex items-center gap-6 mb-6'>
                <div className='flex items-center'>
                  <div className='flex text-yellow-500 mr-2'>
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={
                          i < Math.floor(book.rating || 0) ? 'fill-current' : ''
                        }
                      />
                    ))}
                  </div>
                  <span className='font-semibold'>{book.rating || 0}</span>
                  <span className='text-slate-500 ml-1'>
                    ({book.reviews_count || 0} ratings)
                  </span>
                </div>
                <div className='text-slate-500'>
                  {book.downloads || 0} downloads
                </div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-800 rounded-xl mb-6'>
                <div>
                  <p className='text-sm text-slate-500'>Pages</p>
                  <p className='font-semibold'>{book.pages || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-slate-500'>Language</p>
                  <p className='font-semibold'>{book.language || 'English'}</p>
                </div>
                <div>
                  <p className='text-sm text-slate-500'>Edition</p>
                  <p className='font-semibold'>{book.edition || '1st'}</p>
                </div>
                <div>
                  <p className='text-sm text-slate-500'>ISBN</p>
                  <p className='font-semibold text-sm'>{book.isbn || 'N/A'}</p>
                </div>
              </div>

              <div className='mb-8'>
                <h2 className='text-2xl font-bold mb-4'>Description</h2>
                <div className='text-slate-400 space-y-4 whitespace-pre-line'>
                  {book.description}
                </div>
              </div>

              <div>
                <h2 className='text-2xl font-bold mb-4'>Reviews</h2>
                <div className='space-y-4'>
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className='border-b border-slate-700 pb-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div>
                          <p className='font-semibold'>{review.user_name}</p>
                          <div className='flex text-yellow-500 text-sm'>
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={
                                  i < review.rating ? 'fill-current' : ''
                                }
                                size={14}
                              />
                            ))}
                          </div>
                        </div>
                        <p className='text-sm text-slate-500'>
                          {review.created_at}
                        </p>
                      </div>
                      <p className='text-slate-400'>{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
