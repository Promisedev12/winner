import axiosInstance from '../lib/axios';

const readerService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/reader.php/dashboard');
    return response.data;
  },

  // Reading History
  getReadingHistory: async (page = 1) => {
    const response = await axiosInstance.get(
      `/reader.php/history?page=${page}`,
    );
    return response.data;
  },

  // Bookmarks
  getBookmarks: async (type = null) => {
    const params = type ? `?type=${type}` : '';
    const response = await axiosInstance.get(`/reader.php/bookmarks${params}`);
    return response.data;
  },

  addBookmark: async (type, contentId) => {
    const response = await axiosInstance.post('/reader.php/bookmarks', {
      type,
      content_id: contentId,
    });
    return response.data;
  },

  removeBookmark: async (type, contentId) => {
    const response = await axiosInstance.delete(
      `/reader.php/bookmarks/${type}/${contentId}`,
    );
    return response.data;
  },

  // Following
  getFollowing: async (page = 1) => {
    const response = await axiosInstance.get(
      `/reader.php/following?page=${page}`,
    );
    return response.data;
  },

  getFollowers: async (page = 1) => {
    const response = await axiosInstance.get(
      `/reader.php/followers?page=${page}`,
    );
    return response.data;
  },

  followUser: async (userId) => {
    const response = await axiosInstance.post('/reader.php/follow', {
      user_id: userId,
    });
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await axiosInstance.delete(`/reader.php/follow/${userId}`);
    return response.data;
  },

  // Recommendations
  getRecommendations: async () => {
    const response = await axiosInstance.get('/reader.php/recommendations');
    return response.data;
  },

  // Continue Reading
  getContinueReading: async () => {
    const response = await axiosInstance.get('/reader.php/continue-reading');
    return response.data;
  },

  // Update Reading Progress
  updateProgress: async (type, contentId, progress) => {
    const response = await axiosInstance.put('/reader.php/progress', {
      type,
      content_id: contentId,
      progress,
    });
    return response.data;
  },

  // Badges
  getBadges: async () => {
    const response = await axiosInstance.get('/reader.php/badges');
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await axiosInstance.get('/reader.php/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await axiosInstance.put('/reader.php/settings', settings);
    return response.data;
  },

  // Reading Streak
  getStreak: async () => {
    const response = await axiosInstance.get('/reader.php/streak');
    return response.data;
  },
};

export default readerService;
