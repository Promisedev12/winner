import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_CATEGORIES } from '../../lib/constants';

const CategoriesSection = () => {
  // Show first 8 categories
  const categories = BLOG_CATEGORIES.slice(0, 8);

  return (
    <section className='py-24 bg-background dark:bg-background-dark'>
      <div className='container-custom'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold dark:text-white'>
            Explore Categories
          </h2>
          <p className='text-secondary mt-3'>
            Discover content that matches your interests
          </p>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'>
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/category/${category.toLowerCase()}`}
              className='group p-6 bg-white dark:bg-card-dark rounded-2xl text-center transition-all hover:shadow-xl hover:-translate-y-1 border border-border dark:border-border-dark'
            >
              <div className='text-4xl mb-3 group-hover:scale-110 transition-transform'>
                {index === 0 && '💻'}
                {index === 1 && '⚛️'}
                {index === 2 && '🤖'}
                {index === 3 && '📈'}
                {index === 4 && '🎨'}
                {index === 5 && '🎓'}
                {index === 6 && '🧪'}
                {index === 7 && '💪'}
              </div>
              <h3 className='font-semibold dark:text-white'>{category}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
