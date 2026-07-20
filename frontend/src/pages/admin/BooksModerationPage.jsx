import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiFlag,
  FiCalendar,
  FiUser,
  FiDownload,
  FiStar,
  FiBook,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function BooksModerationPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchBooks();
  }, [pagination.current_page, statusFilter]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await adminService.getBooks(
        pagination.current_page,
        statusFilter,
        searchQuery,
      );
      if (response.success) {
        setBooks(response.data.books);
        setPagination({
          current_page: response.data.pagination.current_page,
          total: response.data.pagination.total,
          last_page: response.data.pagination.last_page,
        });
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      showNotification('Failed to fetch books', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookId) => {
    try {
      const response = await adminService.moderateBook(bookId, 'approve');
      if (response.success) {
        showNotification('Book approved successfully', 'success');
        fetchBooks();
      }
    } catch (error) {
      showNotification('Failed to approve book', 'error');
    }
  };

  const handleReject = async (bookId) => {
    try {
      const response = await adminService.moderateBook(bookId, 'reject');
      if (response.success) {
        showNotification('Book rejected', 'success');
        fetchBooks();
      }
    } catch (error) {
      showNotification('Failed to reject book', 'error');
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchBooks();
  };

  const stats = {
    total: pagination.total,
    pending: books.filter((b) => b.status === 'pending').length,
    published: books.filter((b) => b.status === 'published').length,
  };

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
            Books Moderation
          </h1>
          <p className='text-slate-400 mt-1'>
            Review and moderate book publications
          </p>
        </div>
        <button
          onClick={fetchBooks}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw className='text-slate-400' />
        </button>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-white'>{stats.total}</p>
          <p className='text-sm text-slate-400'>Total Books</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-amber-500'>{stats.pending}</p>
          <p className='text-sm text-slate-400'>Pending Review</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center'>
          <p className='text-2xl font-bold text-emerald'>{stats.published}</p>
          <p className='text-sm text-slate-400'>Published</p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search books...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className='w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none'
          />
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'pending'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'published'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'gradient-bg-main text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
        <button
          onClick={handleSearch}
          className='px-4 py-2 bg-royal-blue rounded-lg hover:bg-indigo transition-colors'
        >
          Search
        </button>
      </div>

      <div className='space-y-4'>
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-slate-800 rounded-xl p-6 border border-slate-700'
          >
            <div className='flex flex-wrap gap-6'>
              <img
                src={
                  book.cover_image ||
                  'https://via.placeholder.com/100x140/1e293b/64748b?text=No+Cover'
                }
                alt={book.title}
                className='w-24 h-32 rounded-lg object-cover'
              />
              <div className='flex-1'>
                <div className='flex flex-wrap justify-between items-start gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='text-xs px-2 py-0.5 rounded-full bg-royal-blue/20 text-royal-blue'>
                        {book.category_name || 'Uncategorized'}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          book.status === 'published'
                            ? 'bg-emerald/20 text-emerald'
                            : 'bg-amber-500/20 text-amber-500'
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>
                    <h3 className='text-lg font-semibold text-white mb-2'>
                      {book.title}
                    </h3>
                    <p className='text-sm text-slate-400 mb-2'>
                      by {book.author_name}
                    </p>
                    <div className='flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3'>
                      <span className='flex items-center gap-1'>
                        <FiCalendar size={14} />{' '}
                        {new Date(book.created_at).toLocaleDateString()}
                      </span>
                      <span className='flex items-center gap-1'>
                        <FiDownload size={14} /> {book.downloads || 0} downloads
                      </span>
                      <div className='flex items-center gap-1'>
                        <FiStar size={14} className='text-yellow-500' />
                        <span>{book.rating || 0}</span>
                      </div>
                      <span className='flex items-center gap-1'>
                        💰 ${book.price || 0}
                      </span>
                    </div>
                    <p className='text-slate-400 text-sm line-clamp-2'>
                      {book.description?.substring(0, 150)}...
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        setShowModal(true);
                      }}
                      className='p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-royal-blue transition-colors'
                    >
                      <FiEye size={18} />
                    </button>
                    {book.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(book.id)}
                          className='p-2 rounded-lg bg-emerald/20 text-emerald hover:bg-emerald/30 transition-colors'
                        >
                          <FiCheck size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(book.id)}
                          className='p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors'
                        >
                          <FiX size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {books.length === 0 && (
        <div className='text-center py-12'>
          <FiBook className='w-12 h-12 text-slate-600 mx-auto mb-3' />
          <p className='text-slate-400'>No books found</p>
        </div>
      )}

      {pagination.last_page > 1 && (
        <div className='flex justify-center gap-2 mt-6'>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                current_page: pagination.current_page - 1,
              })
            }
            disabled={pagination.current_page === 1}
            className='px-3 py-1 rounded bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors'
          >
            Previous
          </button>
          <span className='px-3 py-1 text-slate-400'>
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                current_page: pagination.current_page + 1,
              })
            }
            disabled={pagination.current_page === pagination.last_page}
            className='px-3 py-1 rounded bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors'
          >
            Next
          </button>
        </div>
      )}

      {showModal && selectedBook && (
        <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto'>
          <div className='bg-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center'>
              <h3 className='text-lg font-semibold text-white'>Book Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className='p-1 rounded-lg hover:bg-slate-700'
              >
                <FiX size={20} className='text-slate-400' />
              </button>
            </div>
            <div className='p-6'>
              <div className='flex gap-6 mb-6'>
                <img
                  src={
                    selectedBook.cover_image ||
                    'https://via.placeholder.com/150x200/1e293b/64748b?text=No+Cover'
                  }
                  alt={selectedBook.title}
                  className='w-36 h-48 rounded-lg object-cover'
                />
                <div>
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    {selectedBook.title}
                  </h2>
                  <p className='text-slate-400 mb-2'>
                    by {selectedBook.author_name}
                  </p>
                  <div className='flex items-center gap-3 mb-4'>
                    <span className='text-xs px-2 py-0.5 rounded-full bg-royal-blue/20 text-royal-blue'>
                      {selectedBook.category_name || 'Uncategorized'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedBook.status === 'published'
                          ? 'bg-emerald/20 text-emerald'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}
                    >
                      {selectedBook.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-4 gap-4 mb-4 p-3 bg-slate-700/30 rounded-lg'>
                <div className='text-center'>
                  <p className='text-xl font-bold text-white'>
                    {selectedBook.downloads || 0}
                  </p>
                  <p className='text-xs text-slate-400'>Downloads</p>
                </div>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1'>
                    <FiStar className='text-yellow-500 fill-current' />
                    <p className='text-xl font-bold text-white'>
                      {selectedBook.rating || 0}
                    </p>
                  </div>
                  <p className='text-xs text-slate-400'>Rating</p>
                </div>
                <div className='text-center'>
                  <p className='text-xl font-bold text-emerald'>
                    ${selectedBook.price || 0}
                  </p>
                  <p className='text-xs text-slate-400'>Price</p>
                </div>
                <div className='text-center'>
                  <p className='text-xl font-bold text-white'>
                    {selectedBook.pages || 'N/A'}
                  </p>
                  <p className='text-xs text-slate-400'>Pages</p>
                </div>
              </div>

              <div className='mb-4'>
                <h4 className='text-sm font-semibold text-white mb-2'>
                  Description
                </h4>
                <p className='text-slate-400 text-sm'>
                  {selectedBook.description || 'No description available'}
                </p>
              </div>

              {selectedBook.isbn && (
                <div className='mb-4'>
                  <h4 className='text-sm font-semibold text-white mb-2'>
                    ISBN
                  </h4>
                  <p className='text-slate-400 text-sm'>{selectedBook.isbn}</p>
                </div>
              )}

              <div className='flex gap-3 mt-6'>
                {selectedBook.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedBook.id);
                        setShowModal(false);
                      }}
                      className='flex-1 bg-emerald/20 text-emerald py-2 rounded-lg hover:bg-emerald/30'
                    >
                      Approve Book
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedBook.id);
                        setShowModal(false);
                      }}
                      className='flex-1 bg-red-500/20 text-red-500 py-2 rounded-lg hover:bg-red-500/30'
                    >
                      Reject Book
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
