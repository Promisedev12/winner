import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSave,
  FiBell,
  FiMessageCircle,
  FiEdit3,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import bloggerService from '../../services/bloggerService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';

export default function BloggerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    notification_email: true,
    auto_approve_comments: false,
    default_post_status: 'draft',
  });
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await bloggerService.getSettings();
      if (response.success) {
        setSettings({
          notification_email:
            response.data.notification_email === 1 ||
            response.data.notification_email === true,
          auto_approve_comments:
            response.data.auto_approve_comments === 1 ||
            response.data.auto_approve_comments === true,
          default_post_status: response.data.default_post_status || 'draft',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await bloggerService.updateSettings({
        notification_email: settings.notification_email ? 1 : 0,
        auto_approve_comments: settings.auto_approve_comments ? 1 : 0,
        default_post_status: settings.default_post_status,
      });
      if (response.success) {
        setSaved(true);
        showNotification('Settings saved successfully!', 'success');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>
            Blogger Settings
          </h1>
          <p className='text-slate-400 mt-1'>
            Manage your blogging preferences
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='space-y-6'>
        {/* Profile Summary */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Profile Information
          </h3>
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 rounded-full bg-royal-blue/20 flex items-center justify-center text-royal-blue text-2xl font-bold'>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className='font-semibold text-white text-lg'>{user?.name}</p>
              <p className='text-slate-400'>{user?.email}</p>
              <Link
                to='/profile'
                className='text-royal-blue text-sm hover:text-indigo mt-1 inline-block'
              >
                Edit Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <FiBell /> Notification Settings
          </h3>
          <div className='space-y-4'>
            <label className='flex items-center justify-between cursor-pointer'>
              <div>
                <span className='text-slate-300'>Email Notifications</span>
                <p className='text-xs text-slate-500'>
                  Receive email when someone comments on your posts
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  setSettings({
                    ...settings,
                    notification_email: !settings.notification_email,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.notification_email ? 'bg-emerald' : 'bg-slate-600'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.notification_email ? 'right-1' : 'left-1'}`}
                ></div>
              </button>
            </label>
          </div>
        </div>

        {/* Comment Settings */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <FiMessageCircle /> Comment Settings
          </h3>
          <div className='space-y-4'>
            <label className='flex items-center justify-between cursor-pointer'>
              <div>
                <span className='text-slate-300'>Auto-approve Comments</span>
                <p className='text-xs text-slate-500'>
                  Automatically approve comments without moderation
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  setSettings({
                    ...settings,
                    auto_approve_comments: !settings.auto_approve_comments,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.auto_approve_comments ? 'bg-emerald' : 'bg-slate-600'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.auto_approve_comments ? 'right-1' : 'left-1'}`}
                ></div>
              </button>
            </label>
          </div>
        </div>

        {/* Post Settings */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <FiEdit3 /> Post Settings
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Default Post Status
              </label>
              <select
                value={settings.default_post_status}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_post_status: e.target.value,
                  })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              >
                <option value='draft'>Draft - Save as draft by default</option>
                <option value='published'>
                  Published - Publish immediately by default
                </option>
              </select>
              <p className='text-xs text-slate-500 mt-1'>
                Choose the default status when creating new posts
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className='flex justify-end'>
          <button
            onClick={handleSave}
            disabled={saving}
            className='btn-primary'
          >
            {saving ? (
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            ) : (
              <>
                <FiSave className='mr-2' /> Save Settings
              </>
            )}
          </button>
        </div>

        {saved && (
          <div className='bg-emerald/20 border border-emerald rounded-lg p-4 flex items-center gap-2'>
            <FiCheckCircle className='text-emerald' />
            <p className='text-emerald'>Settings saved successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
