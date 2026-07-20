import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookOpen,
  FiEdit3,
  FiUser,
  FiCheck,
  FiArrowRight,
} from 'react-icons/fi';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';

const roles = [
  {
    id: 'reader',
    name: 'Reader',
    icon: <FiUser className='w-12 h-12' />,
    description: 'Read blogs, discover books, and engage with content',
    features: [
      'Read unlimited blogs',
      'Access free books',
      'Bookmark content',
      'Comment and engage',
      'Personalized recommendations',
    ],
  },
  {
    id: 'blogger',
    name: 'Blogger',
    icon: <FiEdit3 className='w-12 h-12' />,
    description: 'Write and publish blogs, build your audience',
    features: [
      'Rich text editor',
      'SEO optimization',
      'Blog analytics',
      'Schedule posts',
      'Build your following',
    ],
  },
  {
    id: 'author',
    name: 'Author',
    icon: <FiBookOpen className='w-12 h-12' />,
    description: 'Publish books, earn royalties, reach readers',
    features: [
      'Upload PDF/EPUB books',
      'Set pricing',
      'Track downloads',
      'Royalty dashboard',
      'Author analytics',
    ],
  },
];

export default function ChooseRolePage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, applyForRole, getDashboardPath } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selectedRole) {
      showNotification('Please select a role to continue', 'warning');
      return;
    }

    // If user selects reader, just go to dashboard
    if (selectedRole === 'reader') {
      const dashboardPath = getDashboardPath();
      navigate(dashboardPath);
      return;
    }

    setLoading(true);
    const result = await applyForRole(selectedRole);

    if (result.success) {
      showNotification(
        `Application for ${selectedRole} role submitted successfully!`,
        'success',
      );
      // After applying, go to dashboard (they'll have reader role until approved)
      const dashboardPath = getDashboardPath();
      navigate(dashboardPath);
    } else {
      showNotification(result.message, 'error');
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-navy via-royal-blue to-indigo py-12 px-4 sm:px-6 lg:px-8'>
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 right-10 w-96 h-96 bg-emerald rounded-full blur-3xl'></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-5xl w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 relative z-10'
      >
        <div className='text-center'>
          <div className='w-16 h-16 gradient-bg-main rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-white text-2xl font-bold'>B</span>
          </div>
          <h2 className='text-3xl font-bold text-dark-text dark:text-white'>
            Choose Your Role
          </h2>
          <p className='mt-2 text-dark-text/60 dark:text-gray-400'>
            How would you like to use BlogLib? You can always add more roles
            later.
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-6 mt-8'>
          {roles.map((role) => (
            <motion.button
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole(role.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                selectedRole === role.id
                  ? 'border-royal-blue bg-royal-blue/5 shadow-lg'
                  : 'border-soft-gray dark:border-gray-700 hover:border-royal-blue/50'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                  selectedRole === role.id
                    ? 'gradient-bg-main text-white'
                    : 'bg-soft-gray dark:bg-gray-700 text-dark-text dark:text-white'
                }`}
              >
                {role.icon}
              </div>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-xl font-bold'>{role.name}</h3>
                {selectedRole === role.id && (
                  <FiCheck className='text-emerald w-5 h-5' />
                )}
              </div>
              <p className='text-dark-text/60 dark:text-gray-400 text-sm mb-4'>
                {role.description}
              </p>
              <ul className='space-y-2'>
                {role.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className='flex items-center text-sm text-dark-text/50 dark:text-gray-500'
                  >
                    <FiCheck className='text-emerald mr-2 w-3 h-3' />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>

        <div className='flex justify-center mt-8'>
          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className='btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            ) : (
              <>
                Continue to Dashboard <FiArrowRight className='ml-2' />
              </>
            )}
          </button>
        </div>

        <p className='text-center text-sm text-dark-text/50 dark:text-gray-500'>
          You can always apply for additional roles later from your account
          settings
        </p>
      </motion.div>
    </div>
  );
}
