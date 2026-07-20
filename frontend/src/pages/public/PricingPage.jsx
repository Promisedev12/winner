import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiCheck,
  FiX,
  FiStar,
  FiZap,
  FiUsers,
  FiBookOpen,
  FiCpu,
  FiDownloadCloud,
  FiMessageCircle,
  FiBarChart2,
} from 'react-icons/fi';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for readers and casual creators',
    features: [
      { name: 'Read unlimited blogs', included: true },
      { name: 'Read free books', included: true },
      { name: 'Basic AI assistant', included: true },
      { name: 'Comment and engage', included: true },
      { name: 'Bookmark content', included: true },
      { name: 'Create blog posts', included: false },
      { name: 'Publish books', included: false },
      { name: 'Advanced AI features', included: false },
      { name: 'Analytics dashboard', included: false },
      { name: 'Priority support', included: false },
    ],
    buttonText: 'Get Started',
    buttonVariant: 'secondary',
    popular: false,
  },
  {
    name: 'Creator',
    price: '$12',
    period: 'month',
    description: 'For serious bloggers and authors',
    features: [
      { name: 'Read unlimited blogs', included: true },
      { name: 'Read free books', included: true },
      { name: 'Advanced AI assistant', included: true },
      { name: 'Comment and engage', included: true },
      { name: 'Bookmark content', included: true },
      { name: 'Create blog posts', included: true },
      { name: 'Publish books', included: true },
      { name: 'SEO optimization', included: true },
      { name: 'Analytics dashboard', included: true },
      { name: 'Priority support', included: true },
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'primary',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For organizations and teams',
    features: [
      { name: 'Everything in Creator', included: true },
      { name: 'Team accounts', included: true },
      { name: 'Custom branding', included: true },
      { name: 'API access', included: true },
      { name: 'SLA guarantee', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Training sessions', included: true },
      { name: 'Advanced security', included: true },
      { name: 'Volume discounts', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'secondary',
    popular: false,
  },
];

const compareFeatures = [
  { name: 'Read Unlimited Blogs', free: true, creator: true, enterprise: true },
  { name: 'Access Free Books', free: true, creator: true, enterprise: true },
  { name: 'Create Blog Posts', free: false, creator: true, enterprise: true },
  { name: 'Publish Books', free: false, creator: true, enterprise: true },
  {
    name: 'AI Writing Assistant',
    free: 'Basic',
    creator: 'Advanced',
    enterprise: 'Advanced',
  },
  { name: 'SEO Optimization', free: false, creator: true, enterprise: true },
  { name: 'Analytics Dashboard', free: false, creator: true, enterprise: true },
  {
    name: 'Premium Books Access',
    free: false,
    creator: 'Limited',
    enterprise: 'Full',
  },
  { name: 'Earn Royalties', free: false, creator: '70%', enterprise: '80%' },
  { name: 'Priority Support', free: false, creator: true, enterprise: true },
  { name: 'API Access', free: false, creator: false, enterprise: true },
  { name: 'Team Accounts', free: false, creator: false, enterprise: true },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className='font-sans antialiased'>
      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-r from-deep-navy via-royal-blue to-indigo text-white overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-20 right-10 w-96 h-96 bg-emerald rounded-full blur-3xl'></div>
        </div>
        <div className='container-custom relative text-center'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>
              Simple, Transparent <span className='gradient-text'>Pricing</span>
            </h1>
            <p className='text-xl max-w-2xl mx-auto text-gray-200'>
              Choose the perfect plan for your needs. All plans include a 14-day
              free trial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom'>
          <div className='grid md:grid-cols-3 gap-8'>
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <div className='bg-gradient-to-r from-royal-blue to-indigo text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center'>
                      <FiStar className='mr-1' /> Most Popular
                    </div>
                  </div>
                )}
                <div
                  className={`card p-8 h-full flex flex-col ${plan.popular ? 'border-2 border-royal-blue' : ''}`}
                >
                  <div className='text-center mb-6'>
                    <h3 className='text-2xl font-bold mb-2'>{plan.name}</h3>
                    <div className='text-4xl font-bold mb-2'>
                      {plan.price}
                      {plan.price !== 'Custom' && (
                        <span className='text-lg font-normal text-dark-text/50'>
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    <p className='text-dark-text/60 dark:text-gray-500'>
                      {plan.description}
                    </p>
                  </div>

                  <div className='flex-grow space-y-3 mb-8'>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className='flex items-center'>
                        {feature.included ? (
                          <FiCheck className='text-emerald mr-3 flex-shrink-0' />
                        ) : (
                          <FiX className='text-gray-400 mr-3 flex-shrink-0' />
                        )}
                        <span
                          className={
                            !feature.included
                              ? 'text-dark-text/50 dark:text-gray-600'
                              : ''
                          }
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={plan.name === 'Enterprise' ? '/contact' : '/register'}
                    className={`${
                      plan.buttonVariant === 'primary'
                        ? 'btn-primary'
                        : 'btn-secondary'
                    } text-center justify-center`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className='section-padding bg-gradient-to-r from-soft-gray to-off-white dark:from-gray-800 dark:to-gray-900'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-12'
          >
            <h2 className='text-3xl font-bold mb-4'>
              Compare All <span className='gradient-text'>Features</span>
            </h2>
            <p className='text-xl text-dark-text/70 dark:text-gray-400'>
              Detailed breakdown of what each plan includes
            </p>
          </motion.div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-soft-gray dark:border-gray-700'>
                  <th className='text-left py-4 px-6 font-semibold'>Feature</th>
                  <th className='text-center py-4 px-6 font-semibold'>Free</th>
                  <th className='text-center py-4 px-6 font-semibold bg-royal-blue/10'>
                    Creator
                  </th>
                  <th className='text-center py-4 px-6 font-semibold'>
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className='border-b border-soft-gray dark:border-gray-700'
                  >
                    <td className='py-4 px-6 font-medium'>{feature.name}</td>
                    <td className='text-center py-4 px-6'>
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <FiCheck className='text-emerald mx-auto' />
                        ) : (
                          <FiX className='text-gray-400 mx-auto' />
                        )
                      ) : (
                        <span className='text-sm'>{feature.free}</span>
                      )}
                    </td>
                    <td className='text-center py-4 px-6 bg-royal-blue/5'>
                      {typeof feature.creator === 'boolean' ? (
                        feature.creator ? (
                          <FiCheck className='text-emerald mx-auto' />
                        ) : (
                          <FiX className='text-gray-400 mx-auto' />
                        )
                      ) : (
                        <span className='text-sm'>{feature.creator}</span>
                      )}
                    </td>
                    <td className='text-center py-4 px-6'>
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <FiCheck className='text-emerald mx-auto' />
                        ) : (
                          <FiX className='text-gray-400 mx-auto' />
                        )
                      ) : (
                        <span className='text-sm'>{feature.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Money Back Guarantee */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom'>
          <div className='card p-12 text-center bg-gradient-to-r from-royal-blue/5 to-indigo/5'>
            <div className='w-20 h-20 rounded-full bg-emerald/20 flex items-center justify-center mx-auto mb-4'>
              <FiZap className='w-10 h-10 text-emerald' />
            </div>
            <h2 className='text-2xl md:text-3xl font-bold mb-4'>
              14-Day Money-Back Guarantee
            </h2>
            <p className='text-lg text-dark-text/70 dark:text-gray-400 max-w-2xl mx-auto mb-6'>
              Try BlogLib risk-free. If you're not completely satisfied within
              14 days, we'll refund your payment in full.
            </p>
            <Link to='/register' className='btn-primary'>
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className='section-padding bg-gradient-to-r from-deep-navy to-royal-blue text-white'>
        <div className='container-custom text-center'>
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>
            Still Have Questions?
          </h2>
          <p className='text-xl text-gray-200 mb-8'>
            We're here to help you find the perfect plan for your needs.
          </p>
          <div className='flex flex-col sm:flex-row justify-center gap-4'>
            <Link
              to='/contact'
              className='btn-primary bg-white text-deep-navy hover:bg-gray-100'
            >
              Contact Sales
            </Link>
            <Link
              to='/faq'
              className='btn-secondary border-white text-white hover:bg-white/10'
            >
              View FAQ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
