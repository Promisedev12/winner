import axiosInstance from '../lib/axios';

const authorService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/author.php/dashboard');
    return response.data;
  },

  // Books Management
  getBooks: async (page = 1, status = null, search = null) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await axiosInstance.get(`/author.php/books?${params}`);
    return response.data;
  },

  getBook: async (id) => {
    const response = await axiosInstance.get(`/author.php/books/${id}`);
    return response.data;
  },

  createBook: async (bookData) => {
    const response = await axiosInstance.post('/author.php/books', bookData);
    return response.data;
  },

  updateBook: async (id, bookData) => {
    const response = await axiosInstance.put(
      `/author.php/books/${id}`,
      bookData,
    );
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await axiosInstance.delete(`/author.php/books/${id}`);
    return response.data;
  },

  // Upload
  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await axiosInstance.post(
      '/author.php/upload-cover',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  uploadBookFile: async (file) => {
    const formData = new FormData();
    formData.append('book', file);
    const response = await axiosInstance.post(
      '/author.php/upload-book',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  // Royalties
  getRoyalties: async (range = 'year') => {
    const response = await axiosInstance.get(
      `/author.php/royalties?range=${range}`,
    );
    return response.data;
  },

  getTransactions: async (page = 1) => {
    const response = await axiosInstance.get(
      `/author.php/transactions?page=${page}`,
    );
    return response.data;
  },

  requestWithdrawal: async (amount, method) => {
    const response = await axiosInstance.post('/author.php/withdraw', {
      amount,
      method,
    });
    return response.data;
  },

  // Reviews
  getReviews: async (page = 1, rating = null) => {
    const params = new URLSearchParams({ page });
    if (rating) params.append('rating', rating);
    const response = await axiosInstance.get(`/author.php/reviews?${params}`);
    return response.data;
  },

  replyToReview: async (id, reply) => {
    const response = await axiosInstance.post(
      `/author.php/reviews/${id}/reply`,
      { reply },
    );
    return response.data;
  },

  // Analytics
  getAnalytics: async (range = 'year') => {
    const response = await axiosInstance.get(
      `/author.php/analytics?range=${range}`,
    );
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await axiosInstance.get('/author.php/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await axiosInstance.put('/author.php/settings', settings);
    return response.data;
  },
};

export default authorService;
