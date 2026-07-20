import React from 'react';

const Skeleton = ({ variant = 'text', className = '' }) => {
  const variants = {
    text: 'h-4 bg-gray-200 dark:bg-gray-700 rounded',
    title: 'h-8 bg-gray-200 dark:bg-gray-700 rounded',
    avatar: 'rounded-full bg-gray-200 dark:bg-gray-700',
    card: 'bg-gray-200 dark:bg-gray-700 rounded-xl',
    image: 'bg-gray-200 dark:bg-gray-700 rounded-xl',
  };

  return (
    <div className={`animate-pulse ${variants[variant]} ${className}`}></div>
  );
};

export default Skeleton;
