import React from 'react';
import { Link } from 'react-router-dom';

const trendingTopics = [
  {
    name: 'Artificial Intelligence',
    count: 1245,
    color: 'from-purple-500 to-pink-500',
  },
  { name: 'Web Development', count: 892, color: 'from-blue-500 to-cyan-500' },
  {
    name: 'Machine Learning',
    count: 756,
    color: 'from-green-500 to-emerald-500',
  },
  { name: 'Data Science', count: 634, color: 'from-orange-500 to-red-500' },
  {
    name: 'Cloud Computing',
    count: 521,
    color: 'from-indigo-500 to-purple-500',
  },
  { name: 'Cybersecurity', count: 498, color: 'from-red-500 to-rose-500' },
];

const TrendingSection = () => {
  return (
    <section className='py-24 bg-dark'>
      <div className='container-custom'>
        <div className='text-center mb-12'>
          <span className='badge-ai'>Trending Now</span>
          <h2 className='text-3xl md:text-4xl font-bold mt-3 text-white'>
            Popular Topics
          </h2>
          <p className='text-white/60 mt-2'>
            Join the conversation on hot topics
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {trendingTopics.map((topic, index) => (
            <Link
              key={index}
              to={`/category/${topic.name.toLowerCase().replace(/\s+/g, '-')}`}
              className='group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r shadow-lg transition-transform hover:scale-105'
              style={{
                background: `linear-gradient(135deg, ${topic.color.split(' ')[1]} 0%, ${topic.color.split(' ')[3]} 100%)`,
              }}
            >
              <div className='relative z-10'>
                <h3 className='text-xl font-bold text-white mb-2'>
                  {topic.name}
                </h3>
                <p className='text-white/80'>
                  {topic.count.toLocaleString()} articles
                </p>
              </div>
              <div className='absolute bottom-0 right-0 text-7xl opacity-10 group-hover:opacity-20 transition-opacity'>
                #
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
