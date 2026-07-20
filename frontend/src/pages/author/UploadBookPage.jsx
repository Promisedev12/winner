import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiUpload,
  FiFile,
  FiImage,
  FiCheck,
  FiX,
  FiDollarSign,
  FiBook,
  FiArrowLeft,
  FiRefreshCw,
} from 'react-icons/fi';
import authorService from '../../services/authService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';
export default function UploadBookPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category_id: '',
    price: '',
    is_premium: false,
    language: 'English',
    edition: '1st',
    pages: '',
    isbn: '',
    status: 'draft',
  });

  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [bookFileUrl, setBookFileUrl] = useState('');
  const [coverFileUrl, setCoverFileUrl] = useState('');
  const { showNotification } = useContext(NotificationContext);

  const genres = [
    { id: 1, name: 'Programming' },
    { id: 2, name: 'Data Science' },
    { id: 3, name: 'AI & Machine Learning' },
    { id: 4, name: 'Web Development' },
    { id: 5, name: 'Mobile Development' },
    { id: 6, name: 'Design' },
    { id: 7, name: 'Business' },
    { id: 8, name: 'Marketing' },
    { id: 9, name: 'Self Development' },
    { id: 10, name: 'Fiction' },
  ];

  useEffect(() => {
    if (isEditing) {
      fetchBookData();
    }
  }, [isEditing, id]);

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const response = await authorService.getBook(id);
      if (response.success) {
        const book = response.data;
        setFormData({
          title: book.title || '',
          subtitle: book.subtitle || '',
          description: book.description || '',
          category_id: book.category_id || '',
          price: book.price || '',
          is_premium: book.is_premium || false,
          language: book.language || 'English',
          edition: book.edition || '1st',
          pages: book.pages || '',
          isbn: book.isbn || '',
          status: book.status || 'draft',
        });
        if (book.cover_image) {
          setCoverPreview(book.cover_image);
        }
        if (book.file_url) {
          setBookFileUrl(book.file_url);
        }
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      showNotification('Failed to fetch book data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload cover immediately
    try {
      const formData = new FormData();
      formData.append('cover', file);
      const response = await authorService.uploadCover(file);
      if (response.success) {
        setCoverFileUrl(response.data.url);
        showNotification('Cover uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      showNotification('Failed to upload cover', 'error');
    }
  };

  const handleBookChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBookFile(file);

    // Upload book file immediately
    try {
      const response = await authorService.uploadBookFile(file);
      if (response.success) {
        setBookFileUrl(response.data.url);
        showNotification('Book file uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error uploading book:', error);
      showNotification('Failed to upload book file', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title) {
      showNotification('Title is required', 'error');
      return;
    }
    if (!formData.description) {
      showNotification('Description is required', 'error');
      return;
    }
    if (!bookFileUrl && !isEditing) {
      showNotification('Please upload a book file', 'error');
      return;
    }

    // Build the payload
    const payload = {
      title: formData.title.trim(),
      subtitle: formData.subtitle ? formData.subtitle.trim() : '',
      description: formData.description.trim(),
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      price: formData.price ? parseFloat(formData.price) : 0,
      is_premium: formData.is_premium || parseFloat(formData.price) > 0,
      language: formData.language || 'English',
      edition: formData.edition || '1st',
      pages: formData.pages ? parseInt(formData.pages) : null,
      isbn: formData.isbn || '',
      status: formData.status || 'draft',
      file_url: bookFileUrl || formData.file_url || '',
      cover_image: coverFileUrl || formData.cover_image || '',
    };

    console.log('Sending payload:', payload);

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => setUploadProgress(i), i * 15);
      }

      let response;
      if (isEditing) {
        response = await authorService.updateBook(id, payload);
      } else {
        response = await authorService.createBook(payload);
      }

      if (response.success) {
        showNotification(
          isEditing
            ? 'Book updated successfully!'
            : 'Book published successfully!',
          'success',
        );
        navigate('/author/books');
      } else {
        showNotification(response.message || 'Failed to save book', 'error');
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error saving book:', error);
      showNotification(
        error.response?.data?.message || 'Failed to save book',
        'error',
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue'></div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex items-center gap-4 mb-8'>
        <Link
          to='/author/books'
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiArrowLeft className='text-slate-400' />
        </Link>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>
            {isEditing ? 'Edit Book' : 'Upload New Book'}
          </h1>
          <p className='text-slate-400 mt-1'>
            {isEditing
              ? 'Update your book details'
              : 'Share your knowledge with the world'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Book Cover */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>Book Cover</h3>
          <div className='flex flex-col md:flex-row gap-6'>
            <div className='w-48 h-64 bg-slate-700 rounded-lg overflow-hidden border-2 border-dashed border-slate-600 flex items-center justify-center'>
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt='Cover preview'
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='text-center p-4'>
                  <FiImage className='w-8 h-8 text-slate-500 mx-auto mb-2' />
                  <p className='text-xs text-slate-500'>No cover selected</p>
                </div>
              )}
            </div>
            <div className='flex-1'>
              <label className='block w-full'>
                <div className='border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-royal-blue transition-colors cursor-pointer'>
                  <FiUpload className='w-8 h-8 text-slate-500 mx-auto mb-2' />
                  <p className='text-sm text-slate-400'>
                    Click to upload cover image
                  </p>
                  <p className='text-xs text-slate-500 mt-1'>
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleCoverChange}
                  className='hidden'
                />
              </label>
              {coverFile && (
                <p className='text-xs text-emerald mt-2'>
                  <FiCheck className='inline mr-1' /> {coverFile.name}
                </p>
              )}
              {coverFileUrl && !coverFile && (
                <p className='text-xs text-emerald mt-2'>
                  <FiCheck className='inline mr-1' /> Cover uploaded
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Book Details
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Book Title *
              </label>
              <input
                type='text'
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
                placeholder='Enter book title'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Subtitle
              </label>
              <input
                type='text'
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
                placeholder='Enter subtitle (optional)'
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Description *
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
                placeholder='Describe your book...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Genre *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              >
                <option value=''>Select genre</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Chinese</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Edition
              </label>
              <input
                type='text'
                value={formData.edition}
                onChange={(e) =>
                  setFormData({ ...formData, edition: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Pages
              </label>
              <input
                type='number'
                value={formData.pages}
                onChange={(e) =>
                  setFormData({ ...formData, pages: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                ISBN
              </label>
              <input
                type='text'
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>Pricing</h3>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  checked={formData.is_premium}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      is_premium: true,
                      price: '29.99',
                    })
                  }
                  className='text-royal-blue'
                />
                <span className='text-white'>Premium (Paid)</span>
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  checked={!formData.is_premium}
                  onChange={() =>
                    setFormData({ ...formData, is_premium: false, price: '0' })
                  }
                  className='text-royal-blue'
                />
                <span className='text-white'>Free</span>
              </label>
            </div>
            {formData.is_premium && (
              <div className='max-w-xs'>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Price (USD)
                </label>
                <div className='relative'>
                  <FiDollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
                  <input
                    type='number'
                    step='0.01'
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className='w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
                  />
                </div>
                <p className='text-xs text-slate-500 mt-1'>
                  You earn 70% of each sale
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Book File */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>Book File *</h3>
          <label className='block w-full'>
            <div className='border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-royal-blue transition-colors cursor-pointer'>
              <FiFile className='w-8 h-8 text-slate-500 mx-auto mb-2' />
              <p className='text-sm text-slate-400'>Upload PDF or EPUB file</p>
              <p className='text-xs text-slate-500 mt-1'>Max file size: 50MB</p>
            </div>
            <input
              type='file'
              accept='.pdf,.epub'
              onChange={handleBookChange}
              className='hidden'
            />
          </label>
          {bookFile && (
            <div className='mt-3 flex items-center gap-2 text-sm'>
              <FiCheck className='text-emerald' />
              <span className='text-slate-300'>{bookFile.name}</span>
              <span className='text-slate-500'>
                ({(bookFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
          {bookFileUrl && !bookFile && (
            <div className='mt-3 flex items-center gap-2 text-sm'>
              <FiCheck className='text-emerald' />
              <span className='text-slate-300'>Book file uploaded</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>Status</h3>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                checked={formData.status === 'draft'}
                onChange={() => setFormData({ ...formData, status: 'draft' })}
                className='text-royal-blue'
              />
              <span className='text-white'>Save as Draft</span>
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                checked={formData.status === 'published'}
                onChange={() =>
                  setFormData({ ...formData, status: 'published' })
                }
                className='text-royal-blue'
              />
              <span className='text-white'>Publish Immediately</span>
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-white'>Saving...</span>
              <span className='text-slate-400'>{uploadProgress}%</span>
            </div>
            <div className='h-2 bg-slate-700 rounded-full overflow-hidden'>
              <div
                className='h-full gradient-bg-main rounded-full transition-all duration-300'
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className='flex gap-4 justify-end'>
          <button
            type='button'
            onClick={() => navigate('/author/books')}
            className='px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={uploading}
            className='btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {uploading ? (
              <div className='flex items-center gap-2'>
                <FiRefreshCw className='animate-spin' />
                <span>Saving...</span>
              </div>
            ) : (
              <span>{isEditing ? 'Update Book' : 'Publish Book'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
