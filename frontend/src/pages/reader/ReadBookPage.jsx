import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const ReadBookPage = () => {
  const { bookId } = useParams();
  const [fontSize, setFontSize] = useState('medium');
  const [isDark, setIsDark] = useState(false);

  const fontSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
  };

  return (
    <div
      className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}
    >
      {/* Reader Header */}
      <div
        className={`sticky top-0 z-10 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}
      >
        <div className='container-custom py-3'>
          <div className='flex items-center justify-between'>
            <Link
              to={`/book/${bookId}`}
              className='flex items-center gap-2 text-primary hover:text-primary-dark'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              Back to Book
            </Link>

            <div className='flex items-center gap-4'>
              {/* Font Size Controls */}
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setFontSize('small')}
                  className={`p-1 ${fontSize === 'small' ? 'text-primary' : ''}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('medium')}
                  className={`p-1 text-base ${fontSize === 'medium' ? 'text-primary' : ''}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`p-1 text-lg ${fontSize === 'large' ? 'text-primary' : ''}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`p-1 text-xl ${fontSize === 'xlarge' ? 'text-primary' : ''}`}
                >
                  A
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                {isDark ? (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div className='container-custom py-12'>
        <div className='max-w-3xl mx-auto'>
          <h1 className='text-3xl md:text-4xl font-bold mb-8'>
            Chapter 1: Introduction
          </h1>

          <div className={`${fontSizes[fontSize]} leading-relaxed space-y-6`}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
          </div>

          {/* Reading Progress */}
          <div className='fixed bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-full bg-primary transition-all duration-300'
              style={{ width: '30%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadBookPage;
