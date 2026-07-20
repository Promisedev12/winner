import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiStar,
  FiMessageCircle,
  FiThumbsUp,
  FiFlag,
  FiSearch,
  FiFilter,
  FiMail,
  FiRefreshCw,
} from 'react-icons/fi';
import authorService from '../../services/authService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [ratingStats, setRatingStats] = useState({
    avg_rating: 0,
    total_reviews: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchReviews();
  }, [pagination.current_page, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await authorService.getReviews(
        pagination.current_page,
        ratingFilter === 'all' ? null : parseInt(ratingFilter),
      );
      if (response.success) {
        setReviews(response.data.reviews);
        setRatingStats(response.data.rating_stats);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showNotification('Failed to fetch reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>Reviews</h1>
          <p className='text-slate-400 mt-1'>
            Manage and respond to reader feedback
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='bg-gradient-to-r from-royal-blue/10 to-indigo/10 rounded-xl p-6 border border-royal-blue/20 mb-8'>
        <div className='flex flex-wrap gap-8 items-center'>
          <div className='text-center'>
            <div className='text-5xl font-bold text-white'>
              {ratingStats.avg_rating}
            </div>
            <div className='flex text-yellow-500 my-2'>
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className='fill-current' />
              ))}
            </div>
            <div className='text-sm text-slate-400'>
              {ratingStats.total_reviews} reviews
            </div>
          </div>
          <div className='flex-1 space-y-2'>
            {[
              { stars: 5, count: ratingStats.five_star },
              { stars: 4, count: ratingStats.four_star },
              { stars: 3, count: ratingStats.three_star },
              { stars: 2, count: ratingStats.two_star },
              { stars: 1, count: ratingStats.one_star },
            ].map((rating) => (
              <div key={rating.stars} className='flex items-center gap-3'>
                <span className='text-sm text-white w-12'>
                  {rating.stars} ★
                </span>
                <div className='flex-1 h-2 bg-slate-700 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-yellow-500 rounded-full'
                    style={{
                      width: `${ratingStats.total_reviews > 0 ? (rating.count / ratingStats.total_reviews) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className='text-sm text-slate-400 w-12'>
                  {rating.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search reviews...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className='px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white'
        >
          <option value='all'>All Ratings</option>
          <option value='5'>5 Stars</option>
          <option value='4'>4 Stars</option>
          <option value='3'>3 Stars</option>
          <option value='2'>2 Stars</option>
          <option value='1'>1 Star</option>
        </select>
      </div>

      <div className='space-y-4'>
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-slate-800 rounded-xl p-6 border border-slate-700'
          >
            <div className='flex gap-4'>
              <img
                src={review.user_avatar || 'https://via.placeholder.com/48'}
                alt={review.user_name}
                className='w-12 h-12 rounded-full'
              />
              <div className='flex-1'>
                <div className='flex flex-wrap justify-between items-start gap-2'>
                  <div>
                    <h3 className='font-semibold text-white'>
                      {review.user_name}
                    </h3>
                    <div className='flex items-center gap-2 mt-1'>
                      <div className='flex text-yellow-500'>
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3 h-3 ${i < (review.rating || 0) ? 'fill-current' : ''}`}
                          />
                        ))}
                      </div>
                      <span className='text-xs text-slate-500'>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className='text-xs text-royal-blue'>
                    {review.book_title}
                  </span>
                </div>
                <p className='text-slate-400 mt-3'>{review.content}</p>
                <div className='flex items-center gap-4 mt-4'>
                  <button className='flex items-center gap-1 text-sm text-slate-400 hover:text-royal-blue transition-colors'>
                    <FiThumbsUp size={14} /> Helpful ({review.likes || 0})
                  </button>
                  <button className='flex items-center gap-1 text-sm text-slate-400 hover:text-royal-blue transition-colors'>
                    <FiMail size={14} /> Reply
                  </button>
                  <button className='flex items-center gap-1 text-sm text-slate-400 hover:text-red-500 transition-colors'>
                    <FiFlag size={14} /> Report
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className='text-center py-12'>
          <FiMessageCircle className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No reviews found</p>
        </div>
      )}

      {pagination.last_page > 1 && (
        <div className='flex justify-center gap-2 mt-6'>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                current_page: pagination.current_page - 1,
              })
            }
            disabled={pagination.current_page === 1}
            className='px-3 py-1 rounded bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors'
          >
            Previous
          </button>
          <span className='px-3 py-1 text-slate-400'>
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
            className='px-3 py-1 rounded bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
