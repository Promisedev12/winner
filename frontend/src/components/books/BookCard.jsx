import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../ui/RatingStars';

const BookCard = ({ book, featured = false }) => {
  return (
    <div className={`card-premium group ${featured ? 'lg:flex lg:gap-6' : ''}`}>
      <Link to={`/book/${book.slug || book.id}`}>
        <div
          className={`relative overflow-hidden rounded-xl ${featured ? 'lg:w-64' : ''}`}
        >
          <img
            src={book.cover}
            alt={book.title}
            className='w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105'
          />
          {book.isPremium && (
            <div className='absolute top-3 right-3'>
              <span className='badge-gold flex items-center gap-1'>
                <svg
                  className='w-3 h-3'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
                Premium
              </span>
            </div>
          )}
          {book.discount && (
            <div className='absolute bottom-3 left-3'>
              <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
                -{book.discount}%
              </span>
            </div>
          )}
        </div>

        <div className={featured ? 'flex-1' : ''}>
          <h3
            className={`font-bold mb-1 dark:text-white group-hover:text-primary transition-colors line-clamp-2 ${featured ? 'text-2xl mt-4' : 'text-lg mt-4'}`}
          >
            {book.title}
          </h3>

          <p className='text-secondary text-sm mb-2'>by {book.author}</p>

          <div className='flex items-center gap-2 mb-3'>
            <RatingStars rating={book.rating} size='sm' />
            <span className='text-xs text-secondary'>
              ({book.reviews?.toLocaleString() || 0})
            </span>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              {book.price === 0 ? (
                <span className='text-success font-semibold'>Free</span>
              ) : (
                <div className='flex items-center gap-2'>
                  {book.originalPrice && (
                    <span className='text-secondary line-through text-sm'>
                      ${book.originalPrice}
                    </span>
                  )}
                  <span className='text-primary font-bold'>${book.price}</span>
                </div>
              )}
            </div>
            <span className='badge-primary text-xs'>{book.genre}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BookCard;
