import axiosInstance from '../lib/axios';

const aiService = {
  generateArticle: async (topic) => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'generate_article',
      topic,
    });
    return response.data;
  },

  rewriteContent: async (content, style = 'professional') => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'rewrite',
      content,
      style,
    });
    return response.data;
  },

  checkGrammar: async (text) => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'grammar',
      text,
    });
    return response.data;
  },

  generateSEOTitle: async (topic) => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'seo_title',
      topic,
    });
    return response.data;
  },

  generateSEOKeywords: async (topic) => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'seo_keywords',
      topic,
    });
    return response.data;
  },

  generateOutline: async (topic) => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'outline',
      topic,
    });
    return response.data;
  },

  summarizeContent: async (content) => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'summarize',
      content,
    });
    return response.data;
  },

  generateBookOutline: async (topic) => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'book_outline',
      topic,
    });
    return response.data;
  },

  continueWriting: async (text) => {
    const response = await axiosInstance.post('/ai.php', {
      action: 'continue_writing',
      text,
    });
    return response.data;
  },
};

export default aiService;
