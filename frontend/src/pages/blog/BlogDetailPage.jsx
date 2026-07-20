import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiUser,
  FiTag,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiBookmark,
  FiArrowLeft,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiLink,
  FiClock,
  FiEye,
} from 'react-icons/fi';
import publicService from '../../services/publicService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchBlogData();
    fetchComments();
  }, [id]);

  const fetchBlogData = async () => {
    setLoading(true);
    try {
      const response = await publicService.getBlog(id);
      if (response.success) {
        setBlog(response.data);
        // Fetch related blogs
        const relatedResponse = await publicService.getBlogs(1, {
          category: response.data.category_id,
          limit: 3,
          exclude: id,
        });
        if (relatedResponse.success) {
          setRelatedBlogs(relatedResponse.data.blogs || []);
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // In a real implementation, you'd have a comments endpoint
      // For now, using mock data
      setComments([
        {
          id: 1,
          user_name: 'Michael Chen',
          user_avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          created_at: '2024-12-16',
          content:
            "This is an excellent analysis of AI's impact on content creation. The points about maintaining authentic human voice are spot on!",
          likes: 12,
        },
        {
          id: 2,
          user_name: 'Emma Davis',
          user_avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
          created_at: '2024-12-16',
          content:
            "I've been using AI writing tools and they've definitely increased my productivity. Great article!",
          likes: 8,
        },
      ]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      showNotification('Please login to like this post', 'warning');
      return;
    }
    setLiked(!liked);
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showNotification('Please login to bookmark this post', 'warning');
      return;
    }
    setBookmarked(!bookmarked);
    showNotification(
      bookmarked ? 'Bookmark removed' : 'Bookmarked!',
      'success',
    );
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showNotification('Please login to comment', 'warning');
      return;
    }
    if (commentText.trim()) {
      // In a real implementation, you'd send this to the API
      showNotification('Comment added!', 'success');
      setCommentText('');
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className='container-custom py-12 text-center'>
        <h1 className='text-2xl font-bold text-white'>Blog not found</h1>
        <Link to='/blogs' className='text-royal-blue mt-4 inline-block'>
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className='font-sans antialiased bg-slate-900'>
      {/* Hero Section */}
      <div className='relative h-[60vh] min-h-[400px] overflow-hidden'>
        <img
          src={
            blog.featured_image ||
            'https://via.placeholder.com/1920x1080/1e293b/64748b?text=No+Image'
          }
          alt={blog.title}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/60 to-transparent'></div>

        <div className='absolute bottom-0 left-0 right-0 container-custom pb-12'>
          <Link
            to='/blogs'
            className='inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors'
          >
            <FiArrowLeft className='mr-2' /> Back to Blogs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='flex items-center space-x-2 text-white/80 text-sm mb-4'>
              <span className='bg-royal-blue text-white px-3 py-1 rounded-full text-sm'>
                {blog.category_name || 'General'}
              </span>
              <span className='flex items-center'>
                <FiCalendar className='mr-1' size={14} />{' '}
                {new Date(blog.created_at).toLocaleDateString()}
              </span>
              <span className='flex items-center'>
                <FiClock className='mr-1' size={14} />{' '}
                {blog.read_time || '5 min read'}
              </span>
              <span className='flex items-center'>
                <FiEye className='mr-1' size={14} /> {blog.views || 0} views
              </span>
            </div>

            <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 max-w-4xl'>
              {blog.title}
            </h1>

            <div className='flex items-center space-x-4'>
              <img
                src={blog.author_avatar || 'https://via.placeholder.com/48'}
                alt={blog.author_name}
                className='w-12 h-12 rounded-full object-cover'
              />
              <div>
                <p className='font-semibold text-white'>{blog.author_name}</p>
                <p className='text-white/60 text-sm'>Author</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className='container-custom py-12'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-8'>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='card p-8'
            >
              {/* Action Buttons */}
              <div className='flex items-center justify-between border-b border-slate-700 pb-6 mb-6'>
                <div className='flex items-center space-x-4'>
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      liked
                        ? 'bg-red-500/10 text-red-500'
                        : 'hover:bg-slate-700'
                    }`}
                  >
                    <FiHeart className={liked ? 'fill-current' : ''} />
                    <span>
                      {liked ? (blog.likes || 0) + 1 : blog.likes || 0}
                    </span>
                  </button>
                  <button className='flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-700 transition-all'>
                    <FiMessageCircle />
                    <span>{blog.comments_count || 0}</span>
                  </button>
                  <div className='relative'>
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className='flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-700 transition-all'
                    >
                      <FiShare2 />
                      <span>Share</span>
                    </button>

                    {showShareMenu && (
                      <div className='absolute top-full left-0 mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-2 z-10'>
                        <button className='flex items-center space-x-2 px-4 py-2 hover:bg-slate-700 rounded w-full'>
                          <FiTwitter className='text-blue-400' />
                          <span>Twitter</span>
                        </button>
                        <button className='flex items-center space-x-2 px-4 py-2 hover:bg-slate-700 rounded w-full'>
                          <FiFacebook className='text-blue-600' />
                          <span>Facebook</span>
                        </button>
                        <button className='flex items-center space-x-2 px-4 py-2 hover:bg-slate-700 rounded w-full'>
                          <FiLinkedin className='text-blue-700' />
                          <span>LinkedIn</span>
                        </button>
                        <button className='flex items-center space-x-2 px-4 py-2 hover:bg-slate-700 rounded w-full'>
                          <FiLink />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-all ${
                    bookmarked ? 'text-royal-blue' : 'hover:bg-slate-700'
                  }`}
                >
                  <FiBookmark
                    className={bookmarked ? 'fill-current' : ''}
                    size={20}
                  />
                </button>
              </div>

              {/* Blog Content */}
              <div
                className='prose prose-lg dark:prose-invert max-w-none
                  prose-headings:text-white
                  prose-p:text-slate-300
                  prose-a:text-royal-blue
                  prose-strong:text-white
                  prose-li:text-slate-300'
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className='flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-700'>
                  {blog.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/tag/${tag.slug}`}
                      className='flex items-center space-x-1 px-3 py-1 bg-slate-700 rounded-full text-sm hover:bg-royal-blue hover:text-white transition-colors'
                    >
                      <FiTag size={12} />
                      <span>{tag.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </motion.article>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='card p-8 mt-8'
            >
              <h3 className='text-xl font-bold mb-6'>
                Comments ({comments.length})
              </h3>

              {/* Comment Form */}
              <form onSubmit={handleComment} className='mb-8'>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder='Leave a comment...'
                  rows={4}
                  className='w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none resize-none'
                />
                <button type='submit' className='btn-primary mt-3'>
                  Post Comment
                </button>
              </form>

              {/* Comments List */}
              <div className='space-y-6'>
                {comments.map((comment) => (
                  <div key={comment.id} className='flex space-x-4'>
                    <img
                      src={
                        comment.user_avatar || 'https://via.placeholder.com/40'
                      }
                      alt={comment.user_name}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                    <div className='flex-grow'>
                      <div className='flex items-center justify-between mb-1'>
                        <h4 className='font-semibold'>{comment.user_name}</h4>
                        <span className='text-xs text-slate-500'>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className='text-slate-400 mb-2'>{comment.content}</p>
                      <button className='text-sm text-royal-blue hover:text-indigo'>
                        Like ({comment.likes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-4'>
            <div className='space-y-6'>
              {/* Related Posts */}
              {relatedBlogs.length > 0 && (
                <div className='card p-6'>
                  <h3 className='text-lg font-bold mb-4'>Related Posts</h3>
                  <div className='space-y-4'>
                    {relatedBlogs.map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.id}`}
                        className='flex space-x-3 group'
                      >
                        <img
                          src={
                            post.featured_image ||
                            'https://via.placeholder.com/80x80/1e293b/64748b?text=No+Image'
                          }
                          alt={post.title}
                          className='w-20 h-20 rounded-lg object-cover'
                        />
                        <div>
                          <h4 className='font-semibold group-hover:text-royal-blue transition-colors line-clamp-2'>
                            {post.title}
                          </h4>
                          <div className='flex items-center space-x-2 text-xs text-slate-500 mt-1'>
                            <span>
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{post.read_time || '5 min read'}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className='card p-6 gradient-bg-main text-white'>
                <h3 className='text-lg font-bold mb-2'>
                  Subscribe to Newsletter
                </h3>
                <p className='text-sm text-white/80 mb-4'>
                  Get the latest posts delivered to your inbox
                </p>
                <input
                  type='email'
                  placeholder='Your email'
                  className='w-full px-4 py-2 rounded-lg text-slate-900 mb-3'
                />
                <button className='w-full bg-white text-deep-navy font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors'>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
