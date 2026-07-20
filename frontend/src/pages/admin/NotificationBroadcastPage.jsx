import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiSend,
  FiUsers,
  FiMail,
  FiBell,
  FiTag,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
} from 'react-icons/fi';

export default function NotificationBroadcastPage() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all',
    type: 'email',
    scheduleDate: '',
    scheduleTime: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setFormData({
        title: '',
        message: '',
        audience: 'all',
        type: 'email',
        scheduleDate: '',
        scheduleTime: '',
      });
    }, 2000);
  };

  const stats = {
    totalUsers: 24850,
    activeUsers: 18420,
    subscribers: 6430,
    openRate: 68,
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-white'>
          Notification Broadcast
        </h1>
        <p className='text-slate-400 mt-1'>
          Send emails and notifications to users
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <FiUsers className='text-royal-blue' />
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.totalUsers.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Users</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <FiMail className='text-emerald' />
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.subscribers.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Email Subscribers</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <FiBell className='text-indigo' />
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.activeUsers.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Push Notifications</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <FiEye className='text-amber-500' />
          </div>
          <p className='text-2xl font-bold text-white'>{stats.openRate}%</p>
          <p className='text-xs text-slate-400'>Avg Open Rate</p>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className='grid lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <form
            onSubmit={handleSubmit}
            className='bg-slate-800 rounded-xl p-6 border border-slate-700'
          >
            <h3 className='text-lg font-semibold text-white mb-4'>
              Create Broadcast
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Title
                </label>
                <input
                  type='text'
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder='Broadcast title'
                  className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Message
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder='Write your broadcast message here...'
                  className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none resize-none'
                />
              </div>

              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    <FiTag className='inline mr-1' size={14} /> Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) =>
                      setFormData({ ...formData, audience: e.target.value })
                    }
                    className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
                  >
                    <option value='all'>All Users</option>
                    <option value='readers'>Readers Only</option>
                    <option value='bloggers'>Bloggers Only</option>
                    <option value='authors'>Authors Only</option>
                    <option value='subscribers'>Email Subscribers</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    <FiMail className='inline mr-1' size={14} /> Channel
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
                  >
                    <option value='email'>Email</option>
                    <option value='push'>Push Notification</option>
                    <option value='both'>Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  <FiCalendar className='inline mr-1' size={14} /> Schedule
                  (Optional)
                </label>
                <div className='grid grid-cols-2 gap-4'>
                  <input
                    type='date'
                    value={formData.scheduleDate}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduleDate: e.target.value })
                    }
                    className='px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
                  />
                  <input
                    type='time'
                    value={formData.scheduleTime}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduleTime: e.target.value })
                    }
                    className='px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={sending}
                className='w-full btn-primary justify-center'
              >
                {sending ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                ) : (
                  <>
                    <FiSend className='mr-2' /> Send Broadcast
                  </>
                )}
              </button>

              {sent && (
                <div className='bg-emerald/20 border border-emerald rounded-lg p-3 flex items-center gap-2'>
                  <FiCheckCircle className='text-emerald' />
                  <p className='text-sm text-emerald'>
                    Broadcast sent successfully!
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Tips Panel */}
        <div className='space-y-6'>
          <div className='bg-royal-blue/10 rounded-xl p-6 border border-royal-blue/20'>
            <h3 className='text-sm font-semibold text-royal-blue mb-3'>
              📊 Best Practices
            </h3>
            <ul className='text-xs text-slate-400 space-y-2'>
              <li>• Keep subject lines under 50 characters</li>
              <li>• Personalize your messages</li>
              <li>• Include clear call-to-action buttons</li>
              <li>• Test on different devices before sending</li>
              <li>• Send during peak engagement hours (10 AM - 2 PM)</li>
            </ul>
          </div>

          <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
            <h3 className='text-sm font-semibold text-white mb-3'>
              📈 Recent Campaign Stats
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Weekly Newsletter</span>
                <span className='text-emerald'>68% open rate</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Product Update</span>
                <span className='text-emerald'>72% open rate</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-400'>Promotional Offer</span>
                <span className='text-amber-500'>45% open rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
