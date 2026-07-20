import axiosInstance from '../lib/axios';

const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin.php/dashboard');
    return response.data;
  },

  // User Management
  getUsers: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, ...filters });
    const response = await axiosInstance.get(`/admin.php/users?${params}`);
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await axiosInstance.put('/admin.php/update-user-status', {
      user_id: userId,
      status,
    });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete('/admin.php/delete-user', {
      data: { user_id: userId },
    });
    return response.data;
  },

  // Role Approvals
  getPendingApprovals: async () => {
    const response = await axiosInstance.get('/admin.php/pending-approvals');
    return response.data;
  },

  approveRole: async (userId, role) => {
    const response = await axiosInstance.post('/admin.php/approve-role', {
      user_id: userId,
      role,
    });
    return response.data;
  },

  rejectRole: async (userId, role) => {
    const response = await axiosInstance.post('/admin.php/reject-role', {
      user_id: userId,
      role,
    });
    return response.data;
  },

  // Blog Moderation
  getBlogs: async (page = 1, status = null, search = null) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await axiosInstance.get(`/admin.php/blogs?${params}`);
    return response.data;
  },

  moderateBlog: async (blogId, action) => {
    const response = await axiosInstance.post('/admin.php/moderate-blog', {
      blog_id: blogId,
      action,
    });
    return response.data;
  },

  deleteBlog: async (blogId) => {
    const response = await axiosInstance.delete('/admin.php/delete-blog', {
      data: { blog_id: blogId },
    });
    return response.data;
  },

  // Book Moderation
  getBooks: async (page = 1, status = null, search = null) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await axiosInstance.get(`/admin.php/books?${params}`);
    return response.data;
  },

  moderateBook: async (bookId, action) => {
    const response = await axiosInstance.post('/admin.php/moderate-book', {
      book_id: bookId,
      action,
    });
    return response.data;
  },

  deleteBook: async (bookId) => {
    const response = await axiosInstance.delete('/admin.php/delete-book', {
      data: { book_id: bookId },
    });
    return response.data;
  },

  // Reported Content
  getReportedContent: async (type = null) => {
    const params = type ? `?type=${type}` : '';
    const response = await axiosInstance.get(
      `/admin.php/reported-content${params}`,
    );
    return response.data;
  },

  // Analytics
  getPlatformStats: async () => {
    const response = await axiosInstance.get('/admin.php/platform-stats');
    return response.data;
  },

  getRevenueStats: async (range = 'year') => {
    const response = await axiosInstance.get(
      `/admin.php/revenue?range=${range}`,
    );
    return response.data;
  },

  // Subscriptions
  getSubscriptions: async (page = 1) => {
    const response = await axiosInstance.get(
      `/admin.php/subscriptions?page=${page}`,
    );
    return response.data;
  },

  cancelSubscription: async (subscriptionId) => {
    const response = await axiosInstance.post(
      '/admin.php/cancel-subscription',
      { subscription_id: subscriptionId },
    );
    return response.data;
  },

  // Notifications
  sendBroadcast: async (data) => {
    const response = await axiosInstance.post('/admin.php/broadcast', data);
    return response.data;
  },

  // Activity Logs
  getActivityLogs: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await axiosInstance.get(
      `/admin.php/activity-logs?${params}`,
    );
    return response.data;
  },

  // System Settings
  getSystemSettings: async () => {
    const response = await axiosInstance.get('/admin.php/settings');
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await axiosInstance.post(
      '/admin.php/update-settings',
      settings,
    );
    return response.data;
  },
};

export default adminService;
