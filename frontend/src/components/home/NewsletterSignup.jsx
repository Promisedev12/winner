import React, { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thanks for subscribing!');
    setEmail('');
  };

  return (
    <section className='py-24 bg-gray-50 dark:bg-background-dark'>
      <div className='container-custom'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='text-7xl mb-6'>✉️</div>
          <h2 className='text-4xl md:text-5xl font-bold dark:text-white mb-4'>
            Stay Updated
          </h2>
          <p className='text-secondary text-xl mb-10 max-w-md mx-auto'>
            Get the latest content straight to your inbox
          </p>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col sm:flex-row gap-4 max-w-lg mx-auto'
          >
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email address'
              className='input-premium flex-1 py-4 text-lg'
              required
            />
            <button
              type='submit'
              className='btn-primary px-8 py-4 text-lg whitespace-nowrap'
            >
              Subscribe
            </button>
          </form>

          <p className='text-sm text-secondary mt-6'>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
