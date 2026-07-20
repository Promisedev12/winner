import axiosInstance from '../lib/axios';

const bloggerService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/blogger.php/dashboard');
    return response.data;
  },

  // Posts Management
  getPosts: async (page = 1, status = null, search = null) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await axiosInstance.get(`/blogger.php/posts?${params}`);
    return response.data;
  },

  getPost: async (id) => {
    const response = await axiosInstance.get(`/blogger.php/posts/${id}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await axiosInstance.post('/blogger.php/posts', postData);
    return response.data;
  },

  updatePost: async (id, postData) => {
    const response = await axiosInstance.put(
      `/blogger.php/posts/${id}`,
      postData,
    );
    return response.data;
  },

  deletePost: async (id) => {
    const response = await axiosInstance.delete(`/blogger.php/posts/${id}`);
    return response.data;
  },

  // Drafts
  getDrafts: async (page = 1) => {
    const response = await axiosInstance.get(
      `/blogger.php/drafts?page=${page}`,
    );
    return response.data;
  },

  // Scheduled Posts
  getScheduledPosts: async (page = 1) => {
    const response = await axiosInstance.get(
      `/blogger.php/scheduled?page=${page}`,
    );
    return response.data;
  },

  publishScheduled: async (id) => {
    const response = await axiosInstance.post(
      `/blogger.php/scheduled/${id}/publish`,
    );
    return response.data;
  },

  // Analytics
  getAnalytics: async (range = 'month') => {
    const response = await axiosInstance.get(
      `/blogger.php/analytics?range=${range}`,
    );
    return response.data;
  },

  // Comments Management
  getComments: async (page = 1, status = null) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    const response = await axiosInstance.get(`/blogger.php/comments?${params}`);
    return response.data;
  },

  approveComment: async (id) => {
    const response = await axiosInstance.post(
      `/blogger.php/comments/${id}/approve`,
    );
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await axiosInstance.delete(`/blogger.php/comments/${id}`);
    return response.data;
  },

  replyToComment: async (id, reply) => {
    const response = await axiosInstance.post(
      `/blogger.php/comments/${id}/reply`,
      { reply },
    );
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await axiosInstance.get('/blogger.php/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await axiosInstance.put('/blogger.php/settings', settings);
    return response.data;
  },
};

export default bloggerService;
