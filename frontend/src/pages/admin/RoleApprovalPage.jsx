import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheck,
  FiX,
  FiEye,
  FiMail,
  FiClock,
  FiUser,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function RoleApprovalPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPendingApprovals();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showNotification('Failed to fetch applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, role) => {
    try {
      const response = await adminService.approveRole(userId, role);
      if (response.success) {
        showNotification(`Application approved for ${role} role`, 'success');
        fetchApplications();
      }
    } catch (error) {
      showNotification('Failed to approve application', 'error');
    }
  };

  const handleReject = async (userId, role) => {
    try {
      const response = await adminService.rejectRole(userId, role);
      if (response.success) {
        showNotification(`Application rejected`, 'success');
        fetchApplications();
      }
    } catch (error) {
      showNotification('Failed to reject application', 'error');
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.role_name === filter;
  });

  const stats = {
    total: applications.length,
    bloggers: applications.filter((a) => a.role_name === 'blogger').length,
    authors: applications.filter((a) => a.role_name === 'author').length,
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
            Role Approvals
          </h1>
          <p className='text-slate-400 mt-1'>
            Review and approve blogger/author applications
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Pending Applications</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-emerald'>{stats.bloggers}</p>
          <p className='text-sm text-slate-400'>Blogger Applications</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-amber-500'>{stats.authors}</p>
          <p className='text-sm text-slate-400'>Author Applications</p>
        </div>
      </div>

      <div className='flex gap-2 mb-6 border-b border-slate-800'>
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 px-4 font-medium transition-all ${
            filter === 'all'
              ? 'text-royal-blue border-b-2 border-royal-blue'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('blogger')}
          className={`pb-3 px-4 font-medium transition-all ${
            filter === 'blogger'
              ? 'text-royal-blue border-b-2 border-royal-blue'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bloggers ({stats.bloggers})
        </button>
        <button
          onClick={() => setFilter('author')}
          className={`pb-3 px-4 font-medium transition-all ${
            filter === 'author'
              ? 'text-royal-blue border-b-2 border-royal-blue'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Authors ({stats.authors})
        </button>
      </div>

      <div className='space-y-4'>
        {filteredApps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-slate-800 rounded-xl p-6 border border-slate-700'
          >
            <div className='flex flex-wrap gap-6'>
              <div className='w-16 h-16 rounded-full bg-royal-blue/20 flex items-center justify-center text-royal-blue text-2xl font-bold'>
                {app.name?.charAt(0) || 'U'}
              </div>
              <div className='flex-1'>
                <div className='flex flex-wrap justify-between items-start gap-4'>
                  <div>
                    <h3 className='text-xl font-semibold text-white'>
                      {app.name}
                    </h3>
                    <p className='text-slate-400'>{app.email}</p>
                    <div className='flex items-center gap-3 mt-2'>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          app.role_name === 'blogger'
                            ? 'bg-emerald/20 text-emerald'
                            : 'bg-amber-500/20 text-amber-500'
                        }`}
                      >
                        {app.role_name?.charAt(0).toUpperCase() +
                          app.role_name?.slice(1)}
                      </span>
                      <span className='text-xs text-slate-500 flex items-center gap-1'>
                        <FiClock size={12} /> Applied:{' '}
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowModal(true);
                      }}
                      className='p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-royal-blue transition-colors'
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      onClick={() => handleApprove(app.user_id, app.role_name)}
                      className='px-4 py-2 bg-emerald/20 text-emerald rounded-lg hover:bg-emerald/30 transition-colors flex items-center gap-1'
                    >
                      <FiCheck size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(app.user_id, app.role_name)}
                      className='px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1'
                    >
                      <FiX size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className='text-center py-12'>
          <FiUser className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No pending applications</p>
        </div>
      )}

      {showModal && selectedApp && (
        <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4'>
          <div className='bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center'>
              <h3 className='text-lg font-semibold text-white'>
                Application Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className='p-1 rounded-lg hover:bg-slate-700'
              >
                <FiX size={20} className='text-slate-400' />
              </button>
            </div>
            <div className='p-6'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='w-16 h-16 rounded-full bg-royal-blue/20 flex items-center justify-center text-royal-blue text-2xl font-bold'>
                  {selectedApp.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    {selectedApp.name}
                  </h2>
                  <p className='text-slate-400'>{selectedApp.email}</p>
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-slate-400'>Applied Role</p>
                  <p className='font-semibold text-white'>
                    {selectedApp.role_name}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-slate-400'>Application Date</p>
                  <p className='font-semibold text-white'>
                    {new Date(selectedApp.applied_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => {
                    handleApprove(selectedApp.user_id, selectedApp.role_name);
                    setShowModal(false);
                  }}
                  className='flex-1 bg-emerald/20 text-emerald py-2 rounded-lg hover:bg-emerald/30 transition-colors'
                >
                  <FiCheck className='inline mr-2' /> Approve Application
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedApp.user_id, selectedApp.role_name);
                    setShowModal(false);
                  }}
                  className='flex-1 bg-red-500/20 text-red-500 py-2 rounded-lg hover:bg-red-500/30 transition-colors'
                >
                  <FiX className='inline mr-2' /> Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
