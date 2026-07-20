import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import BlankLayout from '../layouts/BlankLayout';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import PricingPage from '../pages/public/PricingPage';
import FAQPage from '../pages/public/FAQPage';
import TermsPage from '../pages/public/TermsPage';
import PrivacyPage from '../pages/public/PrivacyPage';
import BlogArchive from '../pages/public/BlogArchive';

// Auth Pages
// import LoginPage from '../pages/auth/LoginPage';
// import RegisterPage from '../pages/auth/RegisterPage';
// import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
// import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
// import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
// import ChooseRolePage from '../pages/auth/ChooseRolePage';

// Home
// import HomePage from '../pages/home/HomePage';

// Blog
import BlogsPage from '../pages/blog/BlogsPage';
// import BlogDetailPage from '../pages/blog/BlogDetailPage';
// import CategoryPage from '../pages/blog/CategoryPage';
// import TagPage from '../pages/blog/TagPage';

// Books
// import BooksPage from '../pages/books/BooksPage';
// import BookDetailPage from '../pages/books/BookDetailPage';
// import GenrePage from '../pages/books/GenrePage';

// Reader
// import ReadBookPage from '../pages/reader/ReadBookPage';
// import ReadingHistoryPage from '../pages/reader/ReadingHistoryPage';

// Search
import SearchResultsPage from '../pages/search/SearchResultsPage';

// Dashboard
// import BloggerDashboardPage from '../pages/dashboard/BloggerDashboardPage';
// import AuthorDashboardPage from '../pages/dashboard/AuthorDashboardPage';
// import ReaderDashboardPage from '../pages/dashboard/ReaderDashboardPage';
// import AdminDashboardPage from '../pages/dashboard/AdminDashboardPage';

// Profile
// import ProfilePage from '../pages/profile/ProfilePage';
// import MyProfilePage from '../pages/profile/MyProfilePage';

// Settings
// import SettingsPage from '../pages/settings/SettingsPage';

// Error
// import NotFoundPage from '../pages/error/NotFoundPage';
// import UnauthorizedPage from '../pages/error/UnauthorizedPage';
// import ServerErrorPage from '../pages/error/ServerErrorPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Navbar + Footer */}
      <Route element={<RootLayout />}>
        <Route path='/' element={<LandingPage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/pricing' element={<PricingPage />} />
        <Route path='/faq' element={<FAQPage />} />
        <Route path='/terms' element={<TermsPage />} />
        <Route path='/privacy' element={<PrivacyPage />} />
        <Route path='/blog-archive' element={<BlogArchive />} />
        <Route path='/blogs' element={<BlogsPage />} />
        {/* <Route path='/blog/:slug' element={<BlogDetailPage />} /> */}
        {/* <Route path='/category/:category' element={<CategoryPage />} /> */}
        {/* <Route path='/tag/:tag' element={<TagPage />} /> */}
        {/* <Route path='/books' element={<BooksPage />} />
        <Route path='/book/:slug' element={<BookDetailPage />} />
        <Route path='/genre/:genre' element={<GenrePage />} />
        <Route path='/search' element={<SearchResultsPage />} /> */}
        {/* <Route path='/profile/:username' element={<ProfilePage />} /> */}
      </Route>

      {/* Auth Routes (No Navbar/Footer) */}
      {/* <Route element={<AuthLayout />}>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/verify-email' element={<VerifyEmailPage />} />
        <Route path='/choose-role' element={<ChooseRolePage />} />
      </Route> */}

      {/* Protected Dashboard Routes */}
      {/* <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path='/dashboard/reader' element={<ReaderDashboardPage />} />
          <Route path='/dashboard/blogger' element={<BloggerDashboardPage />} />
          <Route path='/dashboard/author' element={<AuthorDashboardPage />} />
          <Route path='/dashboard/admin' element={<AdminDashboardPage />} />
          <Route path='/my-profile' element={<MyProfilePage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/read/:bookId' element={<ReadBookPage />} />
          <Route path='/reading-history' element={<ReadingHistoryPage />} />
          <Route path='/home' element={<HomePage />} />
        </Route>
      </Route> */}

      {/* Error Routes */}
      {/* <Route element={<BlankLayout />}>
        <Route path='/403' element={<UnauthorizedPage />} />
        <Route path='/500' element={<ServerErrorPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Route> */}
    </Routes>
  );
};

export default AppRoutes;
