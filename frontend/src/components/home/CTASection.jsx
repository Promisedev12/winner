import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className='py-24'>
      <div className='container-custom'>
        <div className='relative overflow-hidden rounded-3xl gradient-bg p-16 md:p-20 text-center'>
          {/* Animated elements */}
          <div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-ai/20 rounded-full blur-3xl'></div>

          <div className='relative z-10'>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6'>
              Ready to Start Your Journey?
            </h2>
            <p className='text-white/80 text-xl mb-10 max-w-2xl mx-auto leading-relaxed'>
              Join thousands of readers and creators on ReadSphere AI. Start
              reading, writing, and publishing today.
            </p>
            <div className='flex flex-col sm:flex-row gap-5 justify-center'>
              <Link
                to='/register'
                className='bg-white text-[#0F172A] hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1'
              >
                Get Started Free
              </Link>
              <Link
                to='/contact'
                className='bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300'
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
