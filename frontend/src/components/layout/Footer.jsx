import { Link } from 'react-router-dom';
import {
  FiTwitter,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi';

export default function Footer() {
  const footerLinks = {
    Platform: [
      { name: 'Blogs', path: '/blogs' },
      { name: 'Books', path: '/books' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'FAQ', path: '/faq' },
    ],
    Company: [
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog-archive' },
    ],
    Legal: [
      { name: 'Terms', path: '/terms' },
      { name: 'Privacy', path: '/privacy' },
      { name: 'Cookies', path: '/cookies' },
      { name: 'Licenses', path: '/licenses' },
    ],
  };

  return (
    <footer className='bg-slate-900 border-t border-slate-800 pt-16 pb-8'>
      <div className='container-custom'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12'>
          {/* Brand Column */}
          <div className='lg:col-span-2'>
            <div className='flex items-center space-x-2 mb-4'>
              <div className='w-10 h-10 gradient-bg-main rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-xl'>B</span>
              </div>
              <span className='text-2xl font-bold gradient-text'>BlogLib</span>
            </div>
            <p className='text-slate-400 mb-4 leading-relaxed'>
              Modern Blog Platform + Smart E-Library + AI Writing Assistant.
              Where knowledge creators and readers connect seamlessly.
            </p>
            <div className='flex space-x-4'>
              <a
                href='#'
                className='text-slate-400 hover:text-royal-blue transition-colors'
              >
                <FiTwitter size={20} />
              </a>
              <a
                href='#'
                className='text-slate-400 hover:text-royal-blue transition-colors'
              >
                <FiGithub size={20} />
              </a>
              <a
                href='#'
                className='text-slate-400 hover:text-royal-blue transition-colors'
              >
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className='font-semibold text-lg mb-4 text-white'>
                {category}
              </h3>
              <ul className='space-y-2'>
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className='text-slate-400 hover:text-royal-blue transition-colors'
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className='border-t border-slate-800 pt-8 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='flex items-center space-x-3 text-slate-400'>
              <FiMapPin className='text-royal-blue' />
              <span>123 Innovation Street, Tech City, TC 12345</span>
            </div>
            <div className='flex items-center space-x-3 text-slate-400'>
              <FiMail className='text-royal-blue' />
              <span>hello@bloglib.com</span>
            </div>
            <div className='flex items-center space-x-3 text-slate-400'>
              <FiPhone className='text-royal-blue' />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-slate-800 pt-8 text-center text-slate-400'>
          <p>&copy; {new Date().getFullYear()} BlogLib. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
