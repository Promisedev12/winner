import axiosInstance from '../lib/axios';

const blogService = {
  getBlogs: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, ...filters });
    const response = await axiosInstance.get(`/blogs.php?${params}`);
    return response.data;
  },

  getBlog: async (id) => {
    const response = await axiosInstance.get(`/blogs.php/${id}`);
    return response.data;
  },

  createBlog: async (blogData) => {
    const response = await axiosInstance.post('/blogs.php', blogData);
    return response.data;
  },

  updateBlog: async (id, blogData) => {
    const response = await axiosInstance.put(`/blogs.php/${id}`, blogData);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await axiosInstance.delete(`/blogs.php/${id}`);
    return response.data;
  },

  getUserBlogs: async (userId, page = 1) => {
    const response = await axiosInstance.get(
      `/blogs.php?author=${userId}&page=${page}`,
    );
    return response.data;
  },
};

export default blogService;
