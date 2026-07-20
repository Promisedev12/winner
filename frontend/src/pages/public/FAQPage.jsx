import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiChevronDown,
  FiSearch,
  FiMessageCircle,
  FiBookOpen,
  FiCpu,
  FiUsers,
  FiDollarSign,
  FiShield,
} from 'react-icons/fi';

const faqCategories = [
  { id: 'all', name: 'All Questions', icon: <FiMessageCircle /> },
  { id: 'general', name: 'General', icon: <FiUsers /> },
  { id: 'blogging', name: 'Blogging', icon: <FiBookOpen /> },
  { id: 'books', name: 'Books & Library', icon: <FiBookOpen /> },
  { id: 'ai', name: 'AI Assistant', icon: <FiCpu /> },
  { id: 'pricing', name: 'Pricing & Billing', icon: <FiDollarSign /> },
  { id: 'security', name: 'Security & Privacy', icon: <FiShield /> },
];

const faqs = {
  general: [
    {
      q: 'What is BlogLib?',
      a: "BlogLib is an all-in-one platform that combines professional blogging, digital e-library, AI writing assistant, and community engagement features. It's designed for content creators and readers alike.",
    },
    {
      q: 'Who can use BlogLib?',
      a: 'Anyone! BlogLib is for readers who want to discover great content, bloggers who want to share their ideas, authors who want to publish books, and organizations looking for content solutions.',
    },
    {
      q: 'Do I need technical skills?',
      a: 'Not at all! BlogLib is designed to be user-friendly for everyone. Our intuitive interface and AI assistance make content creation accessible to all skill levels.',
    },
  ],
  blogging: [
    {
      q: 'How do I start blogging?',
      a: "Simply create an account, apply for the blogger role, and you'll get access to our rich text editor. You can start writing immediately, save drafts, and publish when ready.",
    },
    {
      q: 'Can I schedule posts?',
      a: 'Yes! Bloggers can schedule posts to publish at specific dates and times. This helps maintain a consistent publishing schedule.',
    },
    {
      q: 'Is there SEO support?',
      a: 'Absolutely! Our platform includes built-in SEO tools including meta tags, custom slugs, keyword optimization, and readability scores to help your content rank better.',
    },
    {
      q: 'Can I edit published posts?',
      a: 'Yes, you can edit your published posts at any time. Changes are reflected immediately on your blog.',
    },
  ],
  books: [
    {
      q: 'What formats can I upload?',
      a: 'Authors can upload PDF and EPUB files. We also support DOCX for text-heavy books. All files are converted for optimal online reading.',
    },
    {
      q: 'Can I set prices for my books?',
      a: 'Yes! Authors can choose to make their books free or set a price. For paid books, you earn royalties on each sale.',
    },
    {
      q: 'How do readers access books?',
      a: 'Readers can read books online using our built-in reader, which saves their progress. Premium books can be downloaded for offline reading.',
    },
    {
      q: 'Is there DRM protection?',
      a: 'Yes, we offer basic DRM protection for premium books to prevent unauthorized distribution.',
    },
  ],
  ai: [
    {
      q: 'What can the AI assistant do?',
      a: 'Our AI can generate article drafts, improve your writing, check grammar, optimize for SEO, generate titles, create book outlines, and even continue your writing.',
    },
    {
      q: 'Is the AI free to use?',
      a: 'Basic AI features are free for all users. Advanced features like full article generation and SEO optimization are available with the Creator plan.',
    },
    {
      q: 'How accurate is the AI?',
      a: 'Our AI is highly accurate and constantly improving. However, we always recommend reviewing and editing AI-generated content to ensure it matches your voice.',
    },
  ],
  pricing: [
    {
      q: "What's the difference between plans?",
      a: 'The Free plan is great for readers and casual users. The Creator plan unlocks blogging, publishing, and advanced AI features. Enterprise is for teams and organizations.',
    },
    {
      q: 'Can I upgrade or downgrade?',
      a: 'Yes, you can change your plan at any time from your account settings. Upgrades take effect immediately, downgrades apply at the next billing cycle.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.',
    },
  ],
  security: [
    {
      q: 'Is my data secure?',
      a: 'Yes, we use industry-standard encryption to protect your data. All connections are HTTPS, and we follow best practices for data security.',
    },
    {
      q: 'Who owns my content?',
      a: "You own all content you create on BlogLib. We don't claim any ownership over your blogs or books.",
    },
    {
      q: 'Can I delete my account?',
      a: 'Yes, you can delete your account at any time from your settings. This will permanently remove all your data from our servers.',
    },
  ],
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqs, setOpenFaqs] = useState({});

  const toggleFaq = (category, index) => {
    const key = `${category}-${index}`;
    setOpenFaqs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getAllFaqs = () => {
    if (activeCategory === 'all') {
      return Object.entries(faqs).flatMap(([category, questions]) =>
        questions.map((faq, index) => ({ ...faq, category, index })),
      );
    }
    return (
      faqs[activeCategory]?.map((faq, index) => ({
        ...faq,
        category: activeCategory,
        index,
      })) || []
    );
  };

  const filteredFaqs = getAllFaqs().filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
              Frequently Asked <span className='gradient-text'>Questions</span>
            </h1>
            <p className='text-xl max-w-2xl mx-auto text-gray-200'>
              Find answers to common questions about BlogLib
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className='py-12 bg-off-white dark:bg-gray-900 border-b border-soft-gray dark:border-gray-800'>
        <div className='container-custom'>
          <div className='max-w-2xl mx-auto'>
            <div className='relative'>
              <FiSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search for answers...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-12 pr-4 py-4 rounded-xl border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-royal-blue focus:outline-none transition-colors text-lg'
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom'>
          <div className='grid lg:grid-cols-4 gap-8'>
            {/* Categories Sidebar */}
            <div className='lg:col-span-1'>
              <div className='sticky top-24 space-y-2'>
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeCategory === category.id
                        ? 'gradient-bg-main text-white shadow-lg'
                        : 'text-dark-text dark:text-gray-300 hover:bg-soft-gray dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className='lg:col-span-3'>
              {filteredFaqs.length === 0 ? (
                <div className='text-center py-12'>
                  <p className='text-xl text-dark-text/70 dark:text-gray-400'>
                    No results found for "{searchTerm}"
                  </p>
                  <p className='text-dark-text/50 dark:text-gray-500 mt-2'>
                    Try different keywords or browse categories
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {filteredFaqs.map((faq, idx) => (
                    <motion.div
                      key={`${faq.category}-${faq.index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className='card overflow-hidden'
                    >
                      <button
                        onClick={() => toggleFaq(faq.category, faq.index)}
                        className='w-full flex justify-between items-center p-6 text-left hover:bg-soft-gray/50 dark:hover:bg-gray-800/50 transition-colors'
                      >
                        <span className='text-lg font-semibold'>{faq.q}</span>
                        <FiChevronDown
                          className={`transform transition-transform ${
                            openFaqs[`${faq.category}-${faq.index}`]
                              ? 'rotate-180'
                              : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {openFaqs[`${faq.category}-${faq.index}`] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='border-t border-soft-gray dark:border-gray-700'
                          >
                            <div className='p-6 text-dark-text/70 dark:text-gray-400'>
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className='section-padding bg-gradient-to-r from-deep-navy to-royal-blue text-white'>
        <div className='container-custom text-center'>
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>
            Still Have Questions?
          </h2>
          <p className='text-xl text-gray-200 mb-8'>
            Can't find what you're looking for? Our support team is here to
            help.
          </p>
          <div className='flex flex-col sm:flex-row justify-center gap-4'>
            <Link
              to='/contact'
              className='btn-primary bg-white text-deep-navy hover:bg-gray-100'
            >
              Contact Support
            </Link>
            <Link
              to='/pricing'
              className='btn-secondary border-white text-white hover:bg-white/10'
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
