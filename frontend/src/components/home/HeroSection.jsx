import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className='relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28'>
      {/* Animated Background Gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#4F46E5] to-[#A78BFA] opacity-90'></div>

      {/* Animated Orbs */}
      <div className='absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse'></div>
      <div className='absolute bottom-20 right-10 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl'></div>

      <div className='relative container-custom'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* AI Badge */}
          <div className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in'>
            <span className='relative flex h-3 w-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A78BFA] opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-[#A78BFA]'></span>
            </span>
            <span className='text-white text-sm font-medium tracking-wide'>
              ✨ AI-POWERED PLATFORM
            </span>
          </div>

          {/* Main Heading */}
          <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight animate-slide-up'>
            Read. Write. Create.
            <span className='block bg-gradient-to-r from-white to-[#A78BFA] bg-clip-text text-transparent mt-2'>
              With AI Intelligence.
            </span>
          </h1>

          {/* Subheading */}
          <p className='text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100'>
            ReadSphere AI combines professional blogging, digital library
            management, and AI-powered writing assistance into one intelligent
            ecosystem.
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-5 justify-center animate-slide-up delay-200'>
            <Link
              to='/register'
              className='group bg-white text-[#0F172A] hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-glow hover:-translate-y-1 inline-flex items-center justify-center gap-2'
            >
              Start Reading Free
              <svg
                className='w-5 h-5 group-hover:translate-x-1 transition-transform'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 7l5 5m0 0l-5 5m5-5H6'
                />
              </svg>
            </Link>
            <Link
              to='/pricing'
              className='bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:border-white/50 inline-flex items-center justify-center gap-2'
            >
              View Plans
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
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
            </Link>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-white/10'>
            <div className='text-center'>
              <div className='text-4xl md:text-5xl font-bold text-white'>
                10K+
              </div>
              <div className='text-white/60 text-sm mt-1'>Active Readers</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl md:text-5xl font-bold text-white'>
                5K+
              </div>
              <div className='text-white/60 text-sm mt-1'>Blogs Published</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl md:text-5xl font-bold text-white'>
                2K+
              </div>
              <div className='text-white/60 text-sm mt-1'>Books Available</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl md:text-5xl font-bold text-white'>
                98%
              </div>
              <div className='text-white/60 text-sm mt-1'>
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
