import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiSave,
  FiSend,
  FiEye,
  FiCalendar,
  FiTag,
  FiImage,
  FiLink,
  FiBold,
  FiItalic,
  FiList,
  FiCode,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiCpu,
  FiX,
} from 'react-icons/fi';
import AIAssistantDrawer from '../../components/ai/AIAssistantDrawer';
import RichTextEditor from '../../components/ui/RichTextEditor';
import bloggerService from '../../services/bloggerService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    tags: '',
    featured_image: '',
    seo_title: '',
    seo_description: '',
    slug: '',
    schedule_date: '',
    schedule_time: '',
    status: 'draft',
  });
  const [categories, setCategories] = useState([]);
  const { showNotification } = useContext(NotificationContext);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch post data if editing
  useEffect(() => {
    if (isEditing) {
      fetchPostData();
    }
  }, [isEditing, id]);

  const fetchCategories = async () => {
    try {
      // Categories list - in production, fetch from API
      const categoriesList = [
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Programming' },
        { id: 3, name: 'AI' },
        { id: 4, name: 'Web Development' },
        { id: 5, name: 'Data Science' },
        { id: 6, name: 'Design' },
        { id: 7, name: 'Business' },
        { id: 8, name: 'Marketing' },
        { id: 9, name: 'Education' },
      ];
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPostData = async () => {
    setLoading(true);
    try {
      const response = await bloggerService.getPost(id);
      if (response.success) {
        const post = response.data;
        setFormData({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          category_id: post.category_id || '',
          tags: post.tags?.map((t) => t.name).join(', ') || '',
          featured_image: post.featured_image || '',
          seo_title: post.seo_title || '',
          seo_description: post.seo_description || '',
          slug: post.slug || '',
          schedule_date: post.scheduled_for
            ? new Date(post.scheduled_for).toISOString().split('T')[0]
            : '',
          schedule_time: post.scheduled_for
            ? new Date(post.scheduled_for).toTimeString().slice(0, 5)
            : '',
          status: post.status || 'draft',
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      showNotification('Failed to fetch post data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();

    const postData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      featured_image: formData.featured_image,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      status: action === 'publish' ? 'published' : 'draft',
    };

    // Add scheduled date if provided
    if (formData.schedule_date && formData.schedule_time) {
      postData.scheduled_for = `${formData.schedule_date} ${formData.schedule_time}:00`;
      postData.status = 'scheduled';
    }

    if (action === 'publish') {
      setPublishing(true);
      try {
        let response;
        if (isEditing) {
          response = await bloggerService.updatePost(id, postData);
        } else {
          response = await bloggerService.createPost(postData);
        }
        if (response.success) {
          showNotification(
            isEditing
              ? 'Post updated successfully!'
              : 'Post published successfully!',
            'success',
          );
          navigate('/blogger/posts');
        } else {
          showNotification(
            response.message || 'Failed to publish post',
            'error',
          );
        }
      } catch (error) {
        console.error('Error publishing post:', error);
        showNotification(
          error.response?.data?.message || 'Failed to publish post',
          'error',
        );
      } finally {
        setPublishing(false);
      }
    } else if (action === 'draft') {
      setSaving(true);
      try {
        let response;
        if (isEditing) {
          response = await bloggerService.updatePost(id, {
            ...postData,
            status: 'draft',
          });
        } else {
          response = await bloggerService.createPost({
            ...postData,
            status: 'draft',
          });
        }
        if (response.success) {
          showNotification('Draft saved successfully!', 'success');
          navigate('/blogger/drafts');
        } else {
          showNotification(response.message || 'Failed to save draft', 'error');
        }
      } catch (error) {
        console.error('Error saving draft:', error);
        showNotification(
          error.response?.data?.message || 'Failed to save draft',
          'error',
        );
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAIInsert = (content) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + '\n\n' + content,
    }));
    setShowAIAssistant(false);
  };

  const handleContentChange = (htmlContent) => {
    setFormData((prev) => ({ ...prev, content: htmlContent }));
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* AI Assistant Button - Floating */}
      <button
        onClick={() => setShowAIAssistant(true)}
        className='fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full gradient-bg-main text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group'
      >
        <FiCpu className='w-6 h-6 group-hover:scale-110 transition-transform' />
      </button>

      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-white'>
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h1>
        <p className='text-slate-400 mt-1'>
          {isEditing
            ? 'Update your existing post'
            : 'Share your knowledge and insights with the world'}
        </p>
      </div>

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onInsertContent={handleAIInsert}
        currentContent={formData.content}
      />

      {/* Preview Modal */}
      {showPreview && (
        <div className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto'>
          <div className='bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center'>
              <h3 className='text-lg font-semibold text-white'>Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className='p-1 rounded-lg hover:bg-slate-700'
              >
                <FiX size={20} className='text-slate-400' />
              </button>
            </div>
            <div className='p-6'>
              <h1 className='text-3xl font-bold text-white mb-4'>
                {formData.title || 'Untitled Post'}
              </h1>
              <div className='text-slate-400 mb-6'>
                {formData.excerpt ||
                  stripHtml(formData.content).substring(0, 200) + '...'}
              </div>
              <div
                className='prose prose-invert max-w-none'
                dangerouslySetInnerHTML={{
                  __html:
                    formData.content ||
                    '<p class="text-slate-500">No content yet...</p>',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Editor Toolbar */}
      <div className='bg-slate-800 rounded-t-xl border border-slate-700 p-3 flex flex-wrap gap-2'>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiBold />
        </button>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiItalic />
        </button>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiList />
        </button>
        <div className='w-px h-6 bg-slate-700 mx-1'></div>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiAlignLeft />
        </button>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiAlignCenter />
        </button>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiAlignRight />
        </button>
        <div className='w-px h-6 bg-slate-700 mx-1'></div>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiLink />
        </button>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiImage />
        </button>
        <button className='p-2 rounded hover:bg-slate-700 text-slate-300'>
          <FiCode />
        </button>
        <div className='w-px h-6 bg-slate-700 mx-1'></div>
        <button
          onClick={() => setShowAIAssistant(true)}
          className='p-2 rounded bg-royal-blue/20 text-royal-blue hover:bg-royal-blue/30 transition-colors flex items-center gap-1'
        >
          <FiCpu size={16} /> AI Assistant
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'publish')} className='space-y-6'>
        <div className='grid lg:grid-cols-3 gap-6'>
          {/* Main Content Column */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Title */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <label className='block text-sm font-semibold text-white mb-2'>
                Post Title *
              </label>
              <input
                type='text'
                placeholder='Enter a compelling title...'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className='w-full text-xl bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
              />
            </div>

            {/* Content Editor */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <div className='flex justify-between items-center mb-4'>
                <label className='text-sm font-semibold text-white'>
                  Content *
                </label>
                <button
                  type='button'
                  onClick={() => setShowAIAssistant(true)}
                  className='text-xs text-royal-blue hover:text-indigo flex items-center gap-1'
                >
                  <FiCpu size={12} /> Write with AI
                </button>
              </div>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder='Start writing your amazing content here...'
              />
            </div>

            {/* Excerpt */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <label className='block text-sm font-semibold text-white mb-2'>
                Excerpt
              </label>
              <textarea
                rows={3}
                placeholder='Write a short excerpt for your post...'
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className='w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
              />
              <p className='text-xs text-slate-500 mt-1'>
                This will appear in blog listings and search results
              </p>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className='space-y-6'>
            {/* Publish Actions */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='text-lg font-semibold text-white mb-4'>Publish</h3>
              <div className='space-y-3'>
                <button
                  type='submit'
                  disabled={publishing || !formData.title || !formData.content}
                  className='w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {publishing ? (
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  ) : (
                    <>
                      <FiSend className='mr-2' />{' '}
                      {isEditing ? 'Update Post' : 'Publish Now'}
                    </>
                  )}
                </button>
                <button
                  type='button'
                  onClick={(e) => handleSubmit(e, 'draft')}
                  disabled={saving}
                  className='w-full btn-secondary justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {saving ? (
                    <div className='w-5 h-5 border-2 border-royal-blue border-t-transparent rounded-full animate-spin'></div>
                  ) : (
                    <>
                      <FiSave className='mr-2' /> Save as Draft
                    </>
                  )}
                </button>
                <button
                  type='button'
                  onClick={() => setShowPreview(true)}
                  className='w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center'
                >
                  <FiEye className='mr-2' /> Preview
                </button>
              </div>
            </div>

            {/* AI Quick Actions */}
            <div className='bg-gradient-to-r from-royal-blue/10 to-indigo/10 rounded-xl p-4 border border-royal-blue/20'>
              <h3 className='text-sm font-semibold text-royal-blue mb-3 flex items-center gap-2'>
                <FiCpu /> AI Quick Actions
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  onClick={() => setShowAIAssistant(true)}
                  className='text-xs px-3 py-2 bg-slate-700 rounded-lg text-slate-300 hover:bg-royal-blue/20 hover:text-royal-blue transition-colors'
                >
                  Generate Title
                </button>
                <button
                  type='button'
                  onClick={() => setShowAIAssistant(true)}
                  className='text-xs px-3 py-2 bg-slate-700 rounded-lg text-slate-300 hover:bg-royal-blue/20 hover:text-royal-blue transition-colors'
                >
                  SEO Optimize
                </button>
                <button
                  type='button'
                  onClick={() => setShowAIAssistant(true)}
                  className='text-xs px-3 py-2 bg-slate-700 rounded-lg text-slate-300 hover:bg-royal-blue/20 hover:text-royal-blue transition-colors'
                >
                  Check Grammar
                </button>
                <button
                  type='button'
                  onClick={() => setShowAIAssistant(true)}
                  className='text-xs px-3 py-2 bg-slate-700 rounded-lg text-slate-300 hover:bg-royal-blue/20 hover:text-royal-blue transition-colors'
                >
                  Generate Outline
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Category
              </h3>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              >
                <option value=''>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='text-lg font-semibold text-white mb-4'>Tags</h3>
              <input
                type='text'
                placeholder='Add tags (comma separated)'
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
              />
              <p className='text-xs text-slate-500 mt-1'>
                e.g., AI, Technology, Programming
              </p>
            </div>

            {/* Featured Image */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Featured Image
              </h3>
              <label className='block w-full'>
                <div className='border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-royal-blue transition-colors cursor-pointer'>
                  <FiImage className='w-8 h-8 text-slate-500 mx-auto mb-2' />
                  <p className='text-sm text-slate-400'>
                    Click to upload image
                  </p>
                  <p className='text-xs text-slate-500 mt-1'>
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input type='file' accept='image/*' className='hidden' />
              </label>
              {formData.featured_image && (
                <div className='mt-3'>
                  <img
                    src={formData.featured_image}
                    alt='Featured'
                    className='w-full h-32 object-cover rounded-lg'
                  />
                  <button className='text-xs text-red-500 mt-1'>Remove</button>
                </div>
              )}
            </div>

            {/* SEO Settings */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                SEO Settings
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-slate-300 mb-1'>
                    SEO Title
                  </label>
                  <input
                    type='text'
                    placeholder='SEO optimized title (60 characters max)'
                    value={formData.seo_title}
                    onChange={(e) =>
                      setFormData({ ...formData, seo_title: e.target.value })
                    }
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-royal-blue focus:outline-none'
                  />
                  <p className='text-xs text-slate-500 mt-1'>
                    {formData.seo_title?.length || 0}/60 characters
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-slate-300 mb-1'>
                    SEO Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder='Meta description for search engines (160 characters max)'
                    value={formData.seo_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo_description: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-royal-blue focus:outline-none'
                  />
                  <p className='text-xs text-slate-500 mt-1'>
                    {formData.seo_description?.length || 0}/160 characters
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-slate-300 mb-1'>
                    URL Slug
                  </label>
                  <input
                    type='text'
                    placeholder='post-url-slug'
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-royal-blue focus:outline-none'
                  />
                  <p className='text-xs text-slate-500 mt-1'>
                    bloglib.com/blog/{formData.slug || 'your-post-slug'}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Schedule
              </h3>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm text-slate-300 mb-1'>
                    Date
                  </label>
                  <input
                    type='date'
                    value={formData.schedule_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schedule_date: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-royal-blue focus:outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm text-slate-300 mb-1'>
                    Time
                  </label>
                  <input
                    type='time'
                    value={formData.schedule_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schedule_time: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-royal-blue focus:outline-none'
                  />
                </div>
              </div>
              <p className='text-xs text-slate-500 mt-3'>
                Leave empty to publish immediately
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
