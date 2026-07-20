import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background dark:bg-background-dark'>
      <div className='text-center px-4'>
        <div className='text-8xl md:text-9xl font-bold gradient-text mb-4'>
          404
        </div>
        <h1 className='text-2xl md:text-3xl font-bold mb-4 dark:text-white'>
          Page Not Found
        </h1>
        <p className='text-secondary mb-8 max-w-md'>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className='flex gap-4 justify-center'>
          <Link to='/' className='btn-primary'>
            Go Home
          </Link>
          <Link to='/contact' className='btn-outline'>
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
