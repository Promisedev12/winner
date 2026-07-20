import React from 'react';

const Input = ({ label, error, icon, className = '', required, ...props }) => {
  return (
    <div className='w-full'>
      {label && (
        <label className='block text-sm font-medium mb-1 dark:text-white'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}
      <div className='relative'>
        {icon && (
          <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary'>
            {icon}
          </div>
        )}
        <input
          className={`input-premium ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
    </div>
  );
};

export default Input;
