import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import PricingPage from './pages/public/PricingPage';
import FAQPage from './pages/public/FAQPage';
import BlogArchive from './pages/public/BlogArchive';
import ChooseRolePage from './pages/auth/ChooseRolePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Main Pages
import BlogsPage from './pages/blog/BlogsPage';
import BlogDetailPage from './pages/blog/BlogDetailPage';
import BooksPage from './pages/books/BooksPage';
import BookDetailPage from './pages/books/BookDetailPage';

// Layouts
import RootLayout from './layouts/RootLayout';
import ReaderLayout from './layouts/ReaderLayout';
import AuthorLayout from './layouts/AuthorLayout';
import BloggerLayout from './layouts/BloggerLayout';
import AdminLayout from './layouts/AdminLayout';

// Protected Route Components
import PrivateRoute from './routes/PrivateRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';

// Reader Pages
import ReaderDashboardPage from './pages/dashboard/ReaderDashboardPage';
import ReadingHistoryPage from './pages/reader/ReadingHistoryPage';
import BookmarksPage from './pages/reader/BookmarksPage';
import FollowingPage from './pages/reader/FollowingPage';

// Author Pages
import AuthorDashboardPage from './pages/dashboard/AuthorDashboardPage';
import BooksManagementPage from './pages/author/BooksManagementPage';
import UploadBookPage from './pages/author/UploadBookPage';
import RoyaltiesPage from './pages/author/RoyaltiesPage';
import ReviewsPage from './pages/author/ReviewsPage';
import AuthorAnalyticsPage from './pages/author/AnalyticsPage';

// Blogger Pages
import BloggerDashboardPage from './pages/dashboard/BloggerDashboardPage';
import PostsManagementPage from './pages/blogger/PostsManagementPage';
import CreatePostPage from './pages/blogger/CreatePostPage';
import DraftsPage from './pages/blogger/DraftsPage';
import ScheduledPostsPage from './pages/blogger/ScheduledPostsPage';
import BloggerAnalyticsPage from './pages/blogger/AnalyticsPage';
import CommentsPage from './pages/blogger/CommentsPage';
import BloggerSettingsPage from './pages/blogger/BloggerSettingsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import RoleApprovalPage from './pages/admin/RoleApprovalPage';
import BlogsModerationPage from './pages/admin/BlogsModerationPage';
import BooksModerationPage from './pages/admin/BooksModerationPage';
import ReportedContentPage from './pages/admin/ReportedContentPage';
import PlatformAnalyticsPage from './pages/admin/PlatformAnalyticsPage';
import RevenueDashboardPage from './pages/admin/RevenueDashboardPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import NotificationBroadcastPage from './pages/admin/NotificationBroadcastPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Main Layout with Navbar - Public Routes */}
              <Route path='/' element={<RootLayout />}>
                <Route index element={<LandingPage />} />
                <Route path='about' element={<AboutPage />} />
                <Route path='contact' element={<ContactPage />} />
                <Route path='pricing' element={<PricingPage />} />
                <Route path='faq' element={<FAQPage />} />
                <Route path='blog-archive' element={<BlogArchive />} />
                <Route path='blogs' element={<BlogsPage />} />
                <Route path='blog/:id' element={<BlogDetailPage />} />
                <Route path='books' element={<BooksPage />} />
                <Route path='book/:id' element={<BookDetailPage />} />
              </Route>

              {/* Auth Routes (No Layout) */}
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route
                path='/choose-role'
                element={
                  <PrivateRoute>
                    <ChooseRolePage />
                  </PrivateRoute>
                }
              />

              {/* Reader Routes - Protected */}
              <Route
                path='/reader'
                element={
                  <PrivateRoute>
                    <ReaderLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<ReaderDashboardPage />} />
                <Route path='dashboard' element={<ReaderDashboardPage />} />
                <Route path='history' element={<ReadingHistoryPage />} />
                <Route path='bookmarks' element={<BookmarksPage />} />
                <Route path='following' element={<FollowingPage />} />
                <Route
                  path='settings'
                  element={
                    <div className='max-w-7xl mx-auto px-4 py-8'>
                      <h1 className='text-2xl font-bold text-white'>
                        Settings
                      </h1>
                    </div>
                  }
                />
              </Route>

              {/* Blogger Routes - Role Protected */}
              <Route
                path='/blogger'
                element={
                  <RoleBasedRoute allowedRoles={['blogger', 'admin']}>
                    <BloggerLayout />
                  </RoleBasedRoute>
                }
              >
                <Route index element={<BloggerDashboardPage />} />
                <Route path='dashboard' element={<BloggerDashboardPage />} />
                <Route path='posts' element={<PostsManagementPage />} />
                <Route path='create' element={<CreatePostPage />} />
                <Route path='edit/:id' element={<CreatePostPage />} />
                <Route path='drafts' element={<DraftsPage />} />
                <Route path='scheduled' element={<ScheduledPostsPage />} />
                <Route path='analytics' element={<BloggerAnalyticsPage />} />
                <Route path='comments' element={<CommentsPage />} />
                <Route path='settings' element={<BloggerSettingsPage />} />
              </Route>

              {/* Author Routes - Role Protected */}
              <Route
                path='/author'
                element={
                  <RoleBasedRoute allowedRoles={['author', 'admin']}>
                    <AuthorLayout />
                  </RoleBasedRoute>
                }
              >
                <Route index element={<AuthorDashboardPage />} />
                <Route path='dashboard' element={<AuthorDashboardPage />} />
                <Route path='books' element={<BooksManagementPage />} />
                <Route path='upload' element={<UploadBookPage />} />
                <Route path='edit/:id' element={<UploadBookPage />} />
                <Route path='royalties' element={<RoyaltiesPage />} />
                <Route path='reviews' element={<ReviewsPage />} />
                <Route path='analytics' element={<AuthorAnalyticsPage />} />
                <Route
                  path='settings'
                  element={
                    <div className='max-w-7xl mx-auto px-4 py-8'>
                      <h1 className='text-2xl font-bold text-white'>
                        Settings
                      </h1>
                    </div>
                  }
                />
              </Route>

              {/* Admin Routes - Role Protected */}
              <Route
                path='/admin'
                element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </RoleBasedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path='dashboard' element={<AdminDashboardPage />} />
                <Route path='users' element={<UsersManagementPage />} />
                <Route path='role-approvals' element={<RoleApprovalPage />} />
                <Route path='blogs' element={<BlogsModerationPage />} />
                <Route path='books' element={<BooksModerationPage />} />
                <Route path='reported' element={<ReportedContentPage />} />
                <Route path='analytics' element={<PlatformAnalyticsPage />} />
                <Route path='revenue' element={<RevenueDashboardPage />} />
                <Route path='subscriptions' element={<SubscriptionsPage />} />
                <Route
                  path='notifications'
                  element={<NotificationBroadcastPage />}
                />
                <Route path='activity-logs' element={<ActivityLogsPage />} />
                <Route path='settings' element={<SystemSettingsPage />} />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
