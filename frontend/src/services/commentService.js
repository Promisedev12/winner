import axiosInstance from '../lib/axios';

const commentService = {
  getBlogComments: async (blogId, page = 1) => {
    const response = await axiosInstance.get(
      `/comments.php/blog/${blogId}?page=${page}`,
    );
    return response.data;
  },

  getBookComments: async (bookId, page = 1) => {
    const response = await axiosInstance.get(
      `/comments.php/book/${bookId}?page=${page}`,
    );
    return response.data;
  },

  addBlogComment: async (blogId, content, parentId = null) => {
    const response = await axiosInstance.post('/comments.php/blog', {
      blog_id: blogId,
      content,
      parent_id: parentId,
    });
    return response.data;
  },

  addBookComment: async (bookId, content, parentId = null) => {
    const response = await axiosInstance.post('/comments.php/book', {
      book_id: bookId,
      content,
      parent_id: parentId,
    });
    return response.data;
  },

  updateComment: async (id, content) => {
    const response = await axiosInstance.put(`/comments.php/${id}`, {
      content,
    });
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await axiosInstance.delete(`/comments.php/${id}`);
    return response.data;
  },
};

export default commentService;
