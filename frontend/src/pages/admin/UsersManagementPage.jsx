import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiShield,
  FiStar,
  FiEye,
  FiX,
  FiCheck,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { useContext } from 'react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current_page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (searchQuery) filters.search = searchQuery;

      const response = await adminService.getUsers(
        pagination.current_page,
        filters,
      );
      if (response.success) {
        setUsers(response.data.users);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      showNotification('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchUsers();
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const response = await adminService.updateUserStatus(userId, newStatus);
      if (response.success) {
        showNotification(`User status updated to ${newStatus}`, 'success');
        fetchUsers();
      }
    } catch (error) {
      showNotification('Failed to update user status', 'error');
    }
  };

  const handleUpdateRole = async (userId, role, action) => {
    try {
      const response = await adminService.updateUserRole(userId, role, action);
      if (response.success) {
        showNotification(`Role ${action}ed successfully`, 'success');
        fetchUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      showNotification('Failed to update role', 'error');
    }
  };

  const stats = {
    total: pagination.total,
    active: users.filter((u) => u.status === 'active').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    pending: users.filter((u) => u.status === 'pending').length,
  };

  const roleColors = {
    reader: 'bg-royal-blue/20 text-royal-blue',
    blogger: 'bg-emerald/20 text-emerald',
    author: 'bg-amber-500/20 text-amber-500',
    admin: 'bg-purple-500/20 text-purple-500',
  };

  const statusColors = {
    active: 'bg-emerald/20 text-emerald',
    suspended: 'bg-red-500/20 text-red-500',
    pending: 'bg-amber-500/20 text-amber-500',
    banned: 'bg-red-500/20 text-red-500',
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
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-white'>
          User Management
        </h1>
        <p className='text-slate-400 mt-1'>Manage all users on the platform</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-4 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Total Users</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-emerald'>{stats.active}</p>
          <p className='text-sm text-slate-400'>Active</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-red-500'>{stats.suspended}</p>
          <p className='text-sm text-slate-400'>Suspended</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-amber-500'>{stats.pending}</p>
          <p className='text-sm text-slate-400'>Pending</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search users by name or email...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPagination({ ...pagination, current_page: 1 });
          }}
          className='px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white'
        >
          <option value='all'>All Roles</option>
          <option value='reader'>Readers</option>
          <option value='blogger'>Bloggers</option>
          <option value='author'>Authors</option>
          <option value='admin'>Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination({ ...pagination, current_page: 1 });
          }}
          className='px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white'
        >
          <option value='all'>All Status</option>
          <option value='active'>Active</option>
          <option value='suspended'>Suspended</option>
          <option value='pending'>Pending</option>
        </select>
        <button
          onClick={handleSearch}
          className='px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-indigo transition-colors'
        >
          Search
        </button>
      </div>

      {/* Users Table */}
      <div className='bg-slate-800 rounded-xl border border-slate-700 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-slate-700/50 border-b border-slate-700'>
              <tr>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  User
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Email
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Role
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Joined
                </th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-white'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='border-b border-slate-700 hover:bg-slate-700/30 transition-colors'
                >
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className='w-8 h-8 rounded-full'
                        />
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-royal-blue/20 flex items-center justify-center text-royal-blue font-bold'>
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className='font-medium text-white'>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-300'>
                    {user.email}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${roleColors[user.role] || 'bg-slate-500/20 text-slate-400'}`}
                    >
                      {user.role?.charAt(0).toUpperCase() +
                        user.role?.slice(1) || 'Reader'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusColors[user.status] || 'bg-slate-500/20 text-slate-400'}`}
                    >
                      {user.status?.charAt(0).toUpperCase() +
                        user.status?.slice(1) || 'Active'}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-400'>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className='p-1 hover:text-royal-blue transition-colors'
                        title='View Details'
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        className='p-1 hover:text-royal-blue transition-colors'
                        title='Send Message'
                      >
                        <FiMail size={16} />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() =>
                            handleUpdateStatus(user.id, 'suspended')
                          }
                          className='p-1 hover:text-red-500 transition-colors'
                          title='Suspend User'
                        >
                          <FiUserX size={16} />
                        </button>
                      ) : user.status === 'suspended' ? (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'active')}
                          className='p-1 hover:text-emerald transition-colors'
                          title='Activate User'
                        >
                          <FiUserCheck size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className='flex justify-center gap-2 mt-6'>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                current_page: pagination.current_page - 1,
              })
            }
            disabled={pagination.current_page === 1}
            className='px-3 py-1 rounded bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors'
          >
            Previous
          </button>
          <span className='px-3 py-1 text-slate-400'>
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                current_page: pagination.current_page + 1,
              })
            }
            disabled={pagination.current_page === pagination.last_page}
            className='px-3 py-1 rounded bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors'
          >
            Next
          </button>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4'>
          <div className='bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center'>
              <h3 className='text-lg font-semibold text-white'>User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className='p-1 rounded-lg hover:bg-slate-700'
              >
                <FiX size={18} className='text-slate-400' />
              </button>
            </div>
            <div className='p-6'>
              <div className='flex items-center gap-4 mb-6'>
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className='w-16 h-16 rounded-full'
                  />
                ) : (
                  <div className='w-16 h-16 rounded-full bg-royal-blue/20 flex items-center justify-center text-royal-blue text-2xl font-bold'>
                    {selectedUser.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    {selectedUser.name}
                  </h2>
                  <p className='text-slate-400'>{selectedUser.email}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-slate-700/50 rounded-lg p-3'>
                  <p className='text-xs text-slate-400'>Role</p>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${roleColors[selectedUser.role] || 'bg-slate-500/20 text-slate-400'}`}
                    >
                      {selectedUser.role?.charAt(0).toUpperCase() +
                        selectedUser.role?.slice(1) || 'Reader'}
                    </span>
                    <select
                      onChange={(e) => {
                        const [role, action] = e.target.value.split('|');
                        if (action === 'approve') {
                          handleUpdateRole(selectedUser.id, role, 'approve');
                        } else if (action === 'remove') {
                          handleUpdateRole(selectedUser.id, role, 'remove');
                        }
                      }}
                      className='text-xs px-2 py-1 bg-slate-700 rounded'
                      defaultValue=''
                    >
                      <option value='' disabled>
                        Change Role
                      </option>
                      <option value='admin|approve'>Make Admin</option>
                      <option value='blogger|approve'>Make Blogger</option>
                      <option value='author|approve'>Make Author</option>
                      <option value='blogger|remove'>Remove Blogger</option>
                      <option value='author|remove'>Remove Author</option>
                    </select>
                  </div>
                </div>
                <div className='bg-slate-700/50 rounded-lg p-3'>
                  <p className='text-xs text-slate-400'>Status</p>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedUser.status]}`}
                    >
                      {selectedUser.status?.charAt(0).toUpperCase() +
                        selectedUser.status?.slice(1)}
                    </span>
                    {selectedUser.status === 'active' ? (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedUser.id, 'suspended')
                        }
                        className='text-xs px-2 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30'
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedUser.id, 'active')
                        }
                        className='text-xs px-2 py-1 bg-emerald/20 text-emerald rounded hover:bg-emerald/30'
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
                <div className='bg-slate-700/50 rounded-lg p-3'>
                  <p className='text-xs text-slate-400'>Joined</p>
                  <p className='font-semibold text-white'>
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className='bg-slate-700/50 rounded-lg p-3'>
                  <p className='text-xs text-slate-400'>Email Verified</p>
                  <p className='font-semibold text-white'>
                    {selectedUser.email_verified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              {selectedUser.bio && (
                <div className='mt-4 bg-slate-700/50 rounded-lg p-3'>
                  <p className='text-xs text-slate-400'>Bio</p>
                  <p className='text-sm text-slate-300'>{selectedUser.bio}</p>
                </div>
              )}
              <div className='flex gap-3 mt-6'>
                <button className='flex-1 btn-primary'>Send Message</button>
                <button className='flex-1 btn-secondary'>View Activity</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
