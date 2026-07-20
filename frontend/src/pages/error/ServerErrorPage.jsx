import React from 'react';
import { Link } from 'react-router-dom';

const ServerErrorPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background dark:bg-background-dark'>
      <div className='text-center px-4'>
        <div className='text-8xl md:text-9xl font-bold text-warning mb-4'>
          500
        </div>
        <h1 className='text-2xl md:text-3xl font-bold mb-4 dark:text-white'>
          Server Error
        </h1>
        <p className='text-secondary mb-8 max-w-md'>
          Something went wrong on our end. Please try again later.
        </p>
        <div className='flex gap-4 justify-center'>
          <button
            onClick={() => window.location.reload()}
            className='btn-primary'
          >
            Try Again
          </button>
          <Link to='/' className='btn-outline'>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
