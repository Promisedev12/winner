import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookmark,
  FiTrash2,
  FiFolder,
  FiPlus,
  FiSearch,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';
import readerService from '../../services/readerService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await readerService.getBookmarks();
      if (response.success) {
        setBookmarks(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      showNotification('Failed to fetch bookmarks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (type, contentId) => {
    try {
      const response = await readerService.removeBookmark(type, contentId);
      if (response.success) {
        showNotification('Bookmark removed', 'success');
        fetchBookmarks();
      }
    } catch (error) {
      showNotification('Failed to remove bookmark', 'error');
    }
  };

  const folders = [
    { name: 'All', count: bookmarks.length },
    { name: 'Blogs', count: bookmarks.filter((b) => b.blog_id).length },
    { name: 'Books', count: bookmarks.filter((b) => b.book_id).length },
  ];

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (selectedFolder === 'Blogs' && !bookmark.blog_id) return false;
    if (selectedFolder === 'Books' && !bookmark.book_id) return false;
    if (searchQuery) {
      const title = bookmark.blog_title || bookmark.book_title || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>
            Bookmarks
          </h1>
          <p className='text-slate-400 mt-1'>
            Save and organize content you love
          </p>
        </div>
        <button
          onClick={fetchBookmarks}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='grid lg:grid-cols-4 gap-8'>
        <div className='lg:col-span-1'>
          <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 sticky top-24'>
            <h3 className='font-semibold text-white mb-3'>Folders</h3>
            <div className='space-y-1'>
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-lg transition-all ${
                    selectedFolder === folder.name
                      ? 'bg-royal-blue/20 text-royal-blue'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{folder.name}</span>
                  <span className='text-xs'>{folder.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='lg:col-span-3'>
          <div className='relative mb-6'>
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              placeholder='Search bookmarks...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
            />
          </div>

          <div className='space-y-4'>
            {filteredBookmarks.length > 0 ? (
              filteredBookmarks.map((bookmark, index) => {
                const isBlog = !!bookmark.blog_id;
                const title = isBlog
                  ? bookmark.blog_title
                  : bookmark.book_title;
                const slug = isBlog ? bookmark.blog_slug : bookmark.book_slug;
                const type = isBlog ? 'blog' : 'book';
                const id = isBlog ? bookmark.blog_id : bookmark.book_id;
                const folder = isBlog ? 'Blogs' : 'Books';

                return (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-royal-blue transition-all group'
                  >
                    <div className='flex gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isBlog
                                ? 'bg-emerald/20 text-emerald'
                                : 'bg-royal-blue/20 text-royal-blue'
                            }`}
                          >
                            {isBlog ? 'Blog' : 'Book'}
                          </span>
                          <span className='text-xs text-slate-500 flex items-center gap-1'>
                            <FiClock size={10} /> Saved on{' '}
                            {new Date(bookmark.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className='font-semibold text-white'>{title}</h3>
                        <div className='flex items-center gap-2 mt-2'>
                          <span className='text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300'>
                            <FiFolder className='inline mr-1' size={10} />{' '}
                            {folder}
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <Link
                          to={`/${type}/${id}`}
                          className='btn-secondary text-sm py-2 px-4'
                        >
                          Read
                        </Link>
                        <button
                          onClick={() => handleRemoveBookmark(type, id)}
                          className='p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100'
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className='text-center py-12'>
                <FiBookmark className='w-12 h-12 text-slate-600 mx-auto mb-3' />
                <p className='text-slate-400'>No bookmarks found</p>
                <Link
                  to='/books'
                  className='text-royal-blue text-sm mt-2 inline-block'
                >
                  Browse content to bookmark →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
