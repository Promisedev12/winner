import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background dark:bg-background-dark'>
      <div className='text-center px-4'>
        <div className='text-8xl md:text-9xl font-bold text-error mb-4'>
          403
        </div>
        <h1 className='text-2xl md:text-3xl font-bold mb-4 dark:text-white'>
          Access Denied
        </h1>
        <p className='text-secondary mb-8 max-w-md'>
          You don't have permission to access this page. Please contact your
          administrator.
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

export default UnauthorizedPage;
