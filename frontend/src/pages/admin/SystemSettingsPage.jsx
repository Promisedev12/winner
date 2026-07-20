import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiSave,
  FiGlobe,
  FiMail,
  FiCreditCard,
  FiShield,
  FiBell,
  FiDatabase,
  FiCode,
  FiCheckCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    site_name: 'BlogLib',
    site_description:
      'Modern Blog Platform + Smart E-Library + AI Writing Assistant',
    contact_email: 'admin@bloglib.com',
    support_email: 'support@bloglib.com',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_user: '',
    currency: 'USD',
    commission_rate: 30,
    min_payout: 50,
    enable_registrations: true,
    email_verification: true,
    moderation_enabled: true,
    ai_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSystemSettings();
      if (response.success) {
        setSettings({
          ...settings,
          ...response.data,
          enable_registrations:
            response.data.enable_registrations === '1' ||
            response.data.enable_registrations === true,
          email_verification:
            response.data.email_verification === '1' ||
            response.data.email_verification === true,
          moderation_enabled:
            response.data.moderation_enabled === '1' ||
            response.data.moderation_enabled === true,
          ai_enabled:
            response.data.ai_enabled === '1' ||
            response.data.ai_enabled === true,
          commission_rate: parseInt(response.data.commission_rate) || 30,
          min_payout: parseInt(response.data.min_payout) || 50,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await adminService.updateSystemSettings(settings);
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
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>
            System Settings
          </h1>
          <p className='text-slate-400 mt-1'>
            Configure platform settings and preferences
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <FiGlobe /> General Settings
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Site Name
              </label>
              <input
                type='text'
                value={settings.site_name}
                onChange={(e) =>
                  setSettings({ ...settings, site_name: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Site Description
              </label>
              <textarea
                rows={2}
                value={settings.site_description}
                onChange={(e) =>
                  setSettings({ ...settings, site_description: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
          </div>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <FiMail /> Email Settings
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Contact Email
              </label>
              <input
                type='email'
                value={settings.contact_email}
                onChange={(e) =>
                  setSettings({ ...settings, contact_email: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Support Email
              </label>
              <input
                type='email'
                value={settings.support_email}
                onChange={(e) =>
                  setSettings({ ...settings, support_email: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                SMTP Host
              </label>
              <input
                type='text'
                value={settings.smtp_host}
                onChange={(e) =>
                  setSettings({ ...settings, smtp_host: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                SMTP Port
              </label>
              <input
                type='text'
                value={settings.smtp_port}
                onChange={(e) =>
                  setSettings({ ...settings, smtp_port: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                SMTP Username
              </label>
              <input
                type='text'
                value={settings.smtp_user}
                onChange={(e) =>
                  setSettings({ ...settings, smtp_user: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
          </div>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <FiCreditCard /> Payment Settings
          </h3>
          <div className='grid md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              >
                <option value='USD'>USD</option>
                <option value='EUR'>EUR</option>
                <option value='GBP'>GBP</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Commission Rate (%)
              </label>
              <input
                type='number'
                value={settings.commission_rate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    commission_rate: parseInt(e.target.value),
                  })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Minimum Payout ($)
              </label>
              <input
                type='number'
                value={settings.min_payout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    min_payout: parseInt(e.target.value),
                  })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
          </div>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <FiShield /> Security & Features
          </h3>
          <div className='space-y-3'>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-slate-300'>Enable User Registrations</span>
              <button
                type='button'
                onClick={() =>
                  setSettings({
                    ...settings,
                    enable_registrations: !settings.enable_registrations,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.enable_registrations ? 'bg-emerald' : 'bg-slate-600'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enable_registrations ? 'right-1' : 'left-1'}`}
                ></div>
              </button>
            </label>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-slate-300'>Require Email Verification</span>
              <button
                type='button'
                onClick={() =>
                  setSettings({
                    ...settings,
                    email_verification: !settings.email_verification,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.email_verification ? 'bg-emerald' : 'bg-slate-600'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.email_verification ? 'right-1' : 'left-1'}`}
                ></div>
              </button>
            </label>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-slate-300'>Content Moderation</span>
              <button
                type='button'
                onClick={() =>
                  setSettings({
                    ...settings,
                    moderation_enabled: !settings.moderation_enabled,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.moderation_enabled ? 'bg-emerald' : 'bg-slate-600'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.moderation_enabled ? 'right-1' : 'left-1'}`}
                ></div>
              </button>
            </label>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-slate-300'>AI Features Enabled</span>
              <button
                type='button'
                onClick={() =>
                  setSettings({ ...settings, ai_enabled: !settings.ai_enabled })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.ai_enabled ? 'bg-emerald' : 'bg-slate-600'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.ai_enabled ? 'right-1' : 'left-1'}`}
                ></div>
              </button>
            </label>
          </div>
        </div>

        <div className='flex justify-end'>
          <button type='submit' disabled={saving} className='btn-primary'>
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
      </form>
    </div>
  );
}
