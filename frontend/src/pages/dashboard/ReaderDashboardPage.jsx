import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiClock,
  FiHeart,
  FiTrendingUp,
  FiAward,
  FiArrowRight,
  FiCalendar,
  FiEye,
  FiDownload,
  FiStar,
  FiBarChart2,
  FiUsers,
  FiBookmark,
  FiRefreshCw,
} from 'react-icons/fi';
import readerService from '../../services/readerService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';

export default function ReaderDashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    blogs_read: 0,
    books_read: 0,
    bookmarks: 0,
    following: 0,
    followers: 0,
    reading_streak: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [badges, setBadges] = useState([]);
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, continueResponse, recResponse, badgesResponse] =
        await Promise.all([
          readerService.getDashboardStats(),
          readerService.getContinueReading(),
          readerService.getRecommendations(),
          readerService.getBadges(),
        ]);

      if (statsResponse.success) {
        setStats(statsResponse.data.stats);
        setRecentActivity(statsResponse.data.recent_activity || []);
      }

      if (continueResponse.success) {
        setContinueReading(continueResponse.data || []);
      }

      if (recResponse.success) {
        setRecommendations(recResponse.data || []);
      }

      if (badgesResponse.success) {
        setBadges(badgesResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
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
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className='text-slate-400 mt-1'>
            Here's what's happening with your reading journey
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
        >
          <FiRefreshCw
            className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiBookOpen className='text-royal-blue' />
            <span className='text-xs text-slate-500'>Total</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.blogs_read + stats.books_read}
          </p>
          <p className='text-xs text-slate-400'>Items Read</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiTrendingUp className='text-emerald' />
            <span className='text-xs text-slate-500'>Streak</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {stats.reading_streak}
          </p>
          <p className='text-xs text-slate-400'>Days in a row</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiBarChart2 className='text-indigo' />
            <span className='text-xs text-slate-500'>Books</span>
          </div>
          <p className='text-2xl font-bold text-white'>{stats.books_read}</p>
          <p className='text-xs text-slate-400'>Books Completed</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiBookmark className='text-royal-blue' />
            <span className='text-xs text-slate-500'>Bookmarks</span>
          </div>
          <p className='text-2xl font-bold text-white'>{stats.bookmarks}</p>
          <p className='text-xs text-slate-400'>Saved Items</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiUsers className='text-rose-500' />
            <span className='text-xs text-slate-500'>Following</span>
          </div>
          <p className='text-2xl font-bold text-white'>{stats.following}</p>
          <p className='text-xs text-slate-400'>Creators</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiAward className='text-amber-500' />
            <span className='text-xs text-slate-500'>Badges</span>
          </div>
          <p className='text-2xl font-bold text-white'>
            {badges.filter((b) => b.earned).length}
          </p>
          <p className='text-xs text-slate-400'>Earned</p>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Left Column - Continue Reading & Recent Activity */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Continue Reading Section */}
          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold text-white'>Continue Reading</h2>
              <Link
                to='/reader/history'
                className='text-royal-blue hover:text-indigo text-sm flex items-center'
              >
                View all <FiArrowRight className='ml-1' />
              </Link>
            </div>
            <div className='space-y-4'>
              {continueReading.length > 0 ? (
                continueReading.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-royal-blue transition-all'
                  >
                    <div className='flex gap-4'>
                      <img
                        src={
                          item.image ||
                          'https://via.placeholder.com/80x100/1e293b/64748b?text=No+Image'
                        }
                        alt={item.title}
                        className='w-20 h-24 rounded-lg object-cover'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              item.content_type === 'book'
                                ? 'bg-royal-blue/20 text-royal-blue'
                                : 'bg-emerald/20 text-emerald'
                            }`}
                          >
                            {item.content_type === 'book' ? 'Book' : 'Blog'}
                          </span>
                          <span className='text-xs text-slate-500'>
                            {new Date(item.last_read).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className='font-semibold text-white mb-1'>
                          {item.title}
                        </h3>
                        <p className='text-sm text-slate-400 mb-2'>
                          by {item.author_name}
                        </p>
                        <div className='relative'>
                          <div className='h-1.5 bg-slate-700 rounded-full overflow-hidden'>
                            <div
                              className='h-full gradient-bg-main rounded-full transition-all duration-500'
                              style={{ width: `${item.progress || 0}%` }}
                            ></div>
                          </div>
                          <p className='text-xs text-slate-400 mt-1'>
                            {item.progress || 0}% complete
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/${item.content_type === 'book' ? 'book' : 'blog'}/${item.content_type === 'book' ? item.book_id : item.blog_id}`}
                        className='self-center btn-secondary text-sm py-2 px-4'
                      >
                        Continue
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className='text-center py-8 text-slate-400'>
                  <p>No items in progress</p>
                  <Link
                    to='/books'
                    className='text-royal-blue text-sm mt-2 inline-block'
                  >
                    Browse books to start reading →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className='text-xl font-bold text-white mb-4'>
              Recent Activity
            </h2>
            <div className='space-y-3'>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700'
                  >
                    <div className='w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-royal-blue'>
                      <FiBookOpen size={14} />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-white'>
                        Read "{activity.content_title}"
                      </p>
                      <p className='text-xs text-slate-500'>
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-4 text-slate-400'>
                  <p className='text-sm'>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Recommendations & Badges */}
        <div className='space-y-8'>
          {/* Reading Streak Card */}
          <div className='bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20 text-center'>
            <div className='text-5xl mb-3'>🔥</div>
            <p className='text-3xl font-bold text-white'>
              {stats.reading_streak}
            </p>
            <p className='text-sm text-slate-400 mb-2'>Day Reading Streak</p>
            <p className='text-xs text-slate-500'>
              Keep it up! Don't break your streak!
            </p>
          </div>

          {/* Quick Navigation Cards */}
          <div className='grid grid-cols-2 gap-3'>
            <Link
              to='/reader/history'
              className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:border-royal-blue transition-all group'
            >
              <FiClock className='w-6 h-6 text-royal-blue mx-auto mb-2' />
              <p className='text-sm font-semibold text-white'>History</p>
              <p className='text-xs text-slate-500'>
                {stats.blogs_read + stats.books_read} items
              </p>
            </Link>
            <Link
              to='/reader/bookmarks'
              className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:border-royal-blue transition-all group'
            >
              <FiBookmark className='w-6 h-6 text-royal-blue mx-auto mb-2' />
              <p className='text-sm font-semibold text-white'>Bookmarks</p>
              <p className='text-xs text-slate-500'>{stats.bookmarks} saved</p>
            </Link>
            <Link
              to='/reader/following'
              className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:border-royal-blue transition-all group'
            >
              <FiUsers className='w-6 h-6 text-royal-blue mx-auto mb-2' />
              <p className='text-sm font-semibold text-white'>Following</p>
              <p className='text-xs text-slate-500'>
                {stats.following} creators
              </p>
            </Link>
            <Link
              to='/reader/settings'
              className='bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:border-royal-blue transition-all group'
            >
              <FiBarChart2 className='w-6 h-6 text-royal-blue mx-auto mb-2' />
              <p className='text-sm font-semibold text-white'>Settings</p>
              <p className='text-xs text-slate-500'>Preferences</p>
            </Link>
          </div>

          {/* Recommended For You */}
          <div>
            <h2 className='text-xl font-bold text-white mb-4'>
              Recommended For You
            </h2>
            <div className='space-y-3'>
              {recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='flex gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-royal-blue transition-all'
                  >
                    <img
                      src={
                        item.featured_image ||
                        item.cover_image ||
                        'https://via.placeholder.com/48x64/1e293b/64748b?text=No+Image'
                      }
                      alt={item.title}
                      className='w-12 h-16 rounded object-cover'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            item.category_id
                              ? 'bg-royal-blue/20 text-royal-blue'
                              : 'bg-emerald/20 text-emerald'
                          }`}
                        >
                          {item.category_name || 'General'}
                        </span>
                      </div>
                      <h4 className='font-semibold text-white text-sm line-clamp-1'>
                        {item.title}
                      </h4>
                      <p className='text-xs text-slate-500'>
                        by {item.author_name}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className='text-center py-4 text-slate-400'>
                  <p className='text-sm'>No recommendations yet</p>
                  <p className='text-xs'>
                    Start reading more content to get personalized
                    recommendations
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Badges Collection */}
          <div>
            <h2 className='text-xl font-bold text-white mb-4'>Your Badges</h2>
            <div className='grid grid-cols-2 gap-3'>
              {badges.length > 0 ? (
                badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center ${
                      badge.earned
                        ? 'bg-slate-800 border border-slate-700'
                        : 'bg-slate-800/50 border border-slate-700 opacity-60'
                    }`}
                  >
                    <div className='text-2xl mb-1'>{badge.icon}</div>
                    <p className='text-xs font-semibold text-white'>
                      {badge.name}
                    </p>
                    {badge.earned ? (
                      <p className='text-[10px] text-slate-500 mt-1'>
                        {badge.date}
                      </p>
                    ) : (
                      <p className='text-[10px] text-slate-500 mt-1'>
                        {badge.progress}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className='col-span-2 text-center py-4 text-slate-400'>
                  <p className='text-sm'>No badges yet</p>
                  <p className='text-xs'>
                    Start reading to earn your first badge!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
