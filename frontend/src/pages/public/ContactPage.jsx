import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiClock,
  FiMessageCircle,
  FiCheckCircle,
} from 'react-icons/fi';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: <FiMail className='w-6 h-6' />,
      title: 'Email Us',
      details: 'hello@bloglib.com',
      subtext: 'support@bloglib.com',
      link: 'mailto:hello@bloglib.com',
    },
    {
      icon: <FiPhone className='w-6 h-6' />,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      subtext: 'Mon-Fri, 9am-6pm EST',
      link: 'tel:+15551234567',
    },
    {
      icon: <FiMapPin className='w-6 h-6' />,
      title: 'Visit Us',
      details: '123 Innovation Street',
      subtext: 'Tech City, TC 12345',
      link: '#',
    },
    {
      icon: <FiClock className='w-6 h-6' />,
      title: 'Support Hours',
      details: '24/7 Online Support',
      subtext: 'Live chat available',
      link: '#',
    },
  ];

  const faqs = [
    {
      question: 'How do I become a blogger?',
      answer:
        'Simply register for an account and apply for the blogger role in your dashboard. Our team will review your application.',
    },
    {
      question: 'Can I publish books as an author?',
      answer:
        'Yes! Authors can upload PDF and EPUB files. You can set books as free or premium and earn royalties.',
    },
    {
      question: 'Is the AI assistant free?',
      answer:
        'Basic AI features are free for all users. Premium features are available with our Pro plan.',
    },
    {
      question: 'How do I get support?',
      answer:
        'We offer 24/7 support via email, live chat, and our help center. Premium users get priority support.',
    },
  ];

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
              Get in <span className='gradient-text'>Touch</span>
            </h1>
            <p className='text-xl max-w-2xl mx-auto text-gray-200'>
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className='section-padding bg-off-white dark:bg-gray-900'>
        <div className='container-custom'>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
            {contactInfo.map((info, index) => (
              <motion.a
                key={index}
                href={info.link}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='card p-6 text-center hover:shadow-2xl transition-all group'
              >
                <div className='w-14 h-14 rounded-full gradient-bg-main flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform'>
                  {info.icon}
                </div>
                <h3 className='text-lg font-bold mb-2'>{info.title}</h3>
                <p className='text-dark-text/80 dark:text-gray-300 font-semibold'>
                  {info.details}
                </p>
                <p className='text-sm text-dark-text/50 dark:text-gray-500'>
                  {info.subtext}
                </p>
              </motion.a>
            ))}
          </div>

          {/* Contact Form & Map */}
          <div className='grid lg:grid-cols-2 gap-12'>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='card p-8'
            >
              <h2 className='text-2xl font-bold mb-6'>
                Send us a <span className='gradient-text'>Message</span>
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='bg-emerald/10 border border-emerald rounded-lg p-6 text-center'
                >
                  <FiCheckCircle className='w-16 h-16 text-emerald mx-auto mb-4' />
                  <h3 className='text-xl font-bold mb-2'>Message Sent!</h3>
                  <p className='text-dark-text/70 dark:text-gray-400'>
                    Thanks for reaching out. We'll get back to you within 24
                    hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div>
                    <label className='block text-sm font-semibold mb-2'>
                      Your Name
                    </label>
                    <input
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-royal-blue focus:outline-none transition-colors'
                      placeholder='John Doe'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-royal-blue focus:outline-none transition-colors'
                      placeholder='john@example.com'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold mb-2'>
                      Subject
                    </label>
                    <input
                      type='text'
                      name='subject'
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-royal-blue focus:outline-none transition-colors'
                      placeholder='How can we help?'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold mb-2'>
                      Message
                    </label>
                    <textarea
                      name='message'
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className='w-full px-4 py-3 rounded-lg border border-soft-gray dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-royal-blue focus:outline-none transition-colors resize-none'
                      placeholder='Tell us more...'
                    />
                  </div>

                  <button type='submit' className='btn-primary w-full'>
                    Send Message <FiSend className='ml-2' />
                  </button>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='space-y-6'
            >
              <div className='card p-6'>
                <h3 className='text-xl font-bold mb-4'>Live Chat Support</h3>
                <p className='text-dark-text/70 dark:text-gray-400 mb-4'>
                  Our support team is available 24/7 to assist you with any
                  questions or issues.
                </p>
                <button className='btn-secondary w-full'>
                  <FiMessageCircle className='inline mr-2' />
                  Start Live Chat
                </button>
              </div>

              <div className='card p-6'>
                <h3 className='text-xl font-bold mb-4'>Office Location</h3>
                <div className='aspect-video rounded-lg overflow-hidden mb-4'>
                  <iframe
                    title='Office Location'
                    src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316bb7c7b3%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1644262071386!5m2!1sen!2sus'
                    className='w-full h-full'
                    style={{ border: 0 }}
                    allowFullScreen=''
                    loading='lazy'
                  ></iframe>
                </div>
                <p className='text-dark-text/70 dark:text-gray-400'>
                  123 Innovation Street, Tech City, TC 12345
                  <br />
                  United States
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='section-padding bg-gradient-to-r from-soft-gray to-off-white dark:from-gray-800 dark:to-gray-900'>
        <div className='container-custom'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-12'
          >
            <h2 className='text-3xl font-bold mb-4'>
              Frequently Asked <span className='gradient-text'>Questions</span>
            </h2>
            <p className='text-xl text-dark-text/70 dark:text-gray-400'>
              Find quick answers to common questions
            </p>
          </motion.div>

          <div className='max-w-3xl mx-auto space-y-4'>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='card p-6'
              >
                <h3 className='text-lg font-bold mb-2'>{faq.question}</h3>
                <p className='text-dark-text/70 dark:text-gray-400'>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>

          <div className='text-center mt-8'>
            <p className='text-dark-text/70 dark:text-gray-400'>
              Still have questions?{' '}
              <Link to='/faq' className='text-royal-blue hover:text-indigo'>
                Visit our FAQ page
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
