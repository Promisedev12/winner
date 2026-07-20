import axiosInstance from '../lib/axios';

const userService = {
  getUsers: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, ...filters });
    const response = await axiosInstance.get(`/users.php?${params}`);
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await axiosInstance.get(`/users.php/profile/${userId}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await axiosInstance.get('/users.php/me');
    return response.data;
  },

  followUser: async (userId) => {
    const response = await axiosInstance.post('/users.php/follow', {
      user_id: userId,
    });
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await axiosInstance.delete('/users.php/unfollow', {
      data: { user_id: userId },
    });
    return response.data;
  },

  getFollowers: async (userId, page = 1) => {
    const response = await axiosInstance.get(
      `/users.php/followers/${userId}?page=${page}`,
    );
    return response.data;
  },

  getFollowing: async (userId, page = 1) => {
    const response = await axiosInstance.get(
      `/users.php/following/${userId}?page=${page}`,
    );
    return response.data;
  },

  bookmarkContent: async (type, contentId) => {
    const response = await axiosInstance.post('/users.php/bookmark', {
      type,
      content_id: contentId,
    });
    return response.data;
  },

  removeBookmark: async (type, contentId) => {
    const response = await axiosInstance.delete('/users.php/bookmark', {
      data: { type, content_id: contentId },
    });
    return response.data;
  },

  getBookmarks: async () => {
    // This would need a dedicated endpoint - for now using a workaround
    const response = await axiosInstance.get('/users.php/bookmarks');
    return response.data;
  },
};

export default userService;
