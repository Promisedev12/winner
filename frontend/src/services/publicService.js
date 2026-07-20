import axiosInstance from '../lib/axios';

const publicService = {
  // Blogs
  getBlogs: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, limit: 9, ...filters });
    const response = await axiosInstance.get(`/blogs.php?${params}`);
    return response.data;
  },

  getBlog: async (id) => {
    const response = await axiosInstance.get(`/blogs.php/${id}`);
    return response.data;
  },

  getBlogBySlug: async (slug) => {
    const response = await axiosInstance.get(`/blogs.php/slug/${slug}`);
    return response.data;
  },

  // Books
  getBooks: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, limit: 8, ...filters });
    const response = await axiosInstance.get(`/books.php?${params}`);
    return response.data;
  },

  getBook: async (id) => {
    const response = await axiosInstance.get(`/books.php/${id}`);
    return response.data;
  },

  getBookBySlug: async (slug) => {
    const response = await axiosInstance.get(`/books.php/slug/${slug}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await axiosInstance.get('/categories.php');
    return response.data;
  },

  // Tags
  getTags: async () => {
    const response = await axiosInstance.get('/tags.php');
    return response.data;
  },

  // Search
  search: async (query, type = 'all') => {
    const response = await axiosInstance.get(
      `/search.php?q=${query}&type=${type}`,
    );
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await axiosInstance.get('/stats.php');
    return response.data;
  },

  // Testimonials (if you have them)
  getTestimonials: async () => {
    // If you have a testimonials endpoint
    const response = await axiosInstance.get('/testimonials.php');
    return response.data;
  },

  // Contact Form
  submitContact: async (data) => {
    const response = await axiosInstance.post('/contact.php', data);
    return response.data;
  },

  // Newsletter Subscription
  subscribeNewsletter: async (email) => {
    const response = await axiosInstance.post('/newsletter.php', { email });
    return response.data;
  },
};

export default publicService;
