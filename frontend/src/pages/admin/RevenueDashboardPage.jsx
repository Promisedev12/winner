import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiDownload,
  FiUsers,
  FiBook,
  FiFileText,
  FiAward,
  FiRefreshCw,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function RevenueDashboardPage() {
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCommission: 0,
    totalTransactions: 0,
  });

  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getRevenueStats(timeRange);
      if (response.success) {
        setRevenueData(response.data.revenue_data || []);
        setTotalStats({
          totalRevenue: response.data.total_stats?.total_revenue || 0,
          totalCommission: response.data.total_stats?.total_commission || 0,
          totalTransactions: response.data.total_stats?.total_transactions || 0,
          monthlyRevenue:
            response.data.revenue_data?.slice(-1)[0]?.revenue || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      showNotification('Failed to fetch revenue data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalRevenue: totalStats.totalRevenue,
    monthlyRevenue: totalStats.monthlyRevenue,
    projectedRevenue: Math.round(totalStats.totalRevenue * 1.15),
    totalPayouts: totalStats.totalRevenue - totalStats.totalCommission,
    platformFee: totalStats.totalCommission,
    growth: 15.8,
    activeSubscriptions: 1240,
    bookSales: revenueData.reduce((acc, d) => acc + (d.transactions || 0), 0),
    avgOrderValue: totalStats.totalTransactions
      ? (totalStats.totalRevenue / totalStats.totalTransactions).toFixed(2)
      : 0,
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
            Revenue Dashboard
          </h1>
          <p className='text-slate-400 mt-1'>
            Track platform revenue and payouts
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={fetchRevenueData}
            className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
          >
            <FiRefreshCw className='text-slate-400' />
          </button>
          <button className='btn-secondary'>
            <FiDownload className='mr-2' /> Export Report
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiDollarSign className='w-4 h-4 text-emerald' />
          </div>
          <p className='text-xl font-bold text-white'>
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Total Revenue</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiTrendingUp className='w-4 h-4 text-emerald' />
          </div>
          <p className='text-xl font-bold text-white'>+{stats.growth}%</p>
          <p className='text-xs text-slate-400'>vs last month</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiUsers className='w-4 h-4 text-royal-blue' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.activeSubscriptions.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Active Subs</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiBook className='w-4 h-4 text-indigo' />
          </div>
          <p className='text-xl font-bold text-white'>
            {stats.bookSales.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Book Sales</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiTrendingUp className='w-4 h-4 text-amber-500' />
          </div>
          <p className='text-xl font-bold text-white'>
            ${stats.platformFee.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Platform Fee (30%)</p>
        </div>
        <div className='bg-slate-800 rounded-xl p-4 border border-slate-700'>
          <div className='flex items-center gap-2 mb-2'>
            <FiAward className='w-4 h-4 text-purple-500' />
          </div>
          <p className='text-xl font-bold text-white'>
            ${stats.projectedRevenue.toLocaleString()}
          </p>
          <p className='text-xs text-slate-400'>Projected Revenue</p>
        </div>
      </div>

      <div className='bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8'>
        <h3 className='text-lg font-semibold text-white mb-4'>Revenue Trend</h3>
        <ResponsiveContainer width='100%' height={400}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
            <XAxis dataKey='date' stroke='#94A3B8' />
            <YAxis stroke='#94A3B8' />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
              }}
              labelStyle={{ color: '#F1F5F9' }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Area
              type='monotone'
              dataKey='revenue'
              stroke='#2563EB'
              fill='#2563EB'
              fillOpacity={0.2}
              name='Revenue'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='grid lg:grid-cols-2 gap-8'>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Top Selling Books
          </h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center p-3 bg-slate-700/30 rounded-lg'>
              <div>
                <p className='font-semibold text-white'>
                  The Complete Python Guide
                </p>
                <p className='text-xs text-slate-400'>by Dr. Emily Brown</p>
              </div>
              <div className='text-right'>
                <p className='font-bold text-emerald'>$37,499</p>
                <p className='text-xs text-slate-500'>12,500 downloads</p>
              </div>
            </div>
            <div className='flex justify-between items-center p-3 bg-slate-700/30 rounded-lg'>
              <div>
                <p className='font-semibold text-white'>
                  Data Science Essentials
                </p>
                <p className='text-xs text-slate-400'>by Dr. Maria Garcia</p>
              </div>
              <div className='text-right'>
                <p className='font-bold text-emerald'>$26,699</p>
                <p className='text-xs text-slate-500'>8,900 downloads</p>
              </div>
            </div>
            <div className='flex justify-between items-center p-3 bg-slate-700/30 rounded-lg'>
              <div>
                <p className='font-semibold text-white'>
                  Advanced Machine Learning
                </p>
                <p className='text-xs text-slate-400'>by Dr. Maria Garcia</p>
              </div>
              <div className='text-right'>
                <p className='font-bold text-emerald'>$9,899</p>
                <p className='text-xs text-slate-500'>3,300 downloads</p>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Payout Schedule
          </h3>
          <div className='space-y-4'>
            <div className='p-4 bg-emerald/10 rounded-lg border border-emerald/20'>
              <div className='flex justify-between items-center'>
                <div>
                  <p className='font-semibold text-white'>Next Payout Date</p>
                  <p className='text-2xl font-bold text-emerald'>
                    January 1, 2025
                  </p>
                </div>
                <FiCalendar className='w-8 h-8 text-emerald opacity-50' />
              </div>
            </div>
            <div className='p-4 bg-slate-700/30 rounded-lg'>
              <div className='flex justify-between mb-2'>
                <span className='text-sm text-slate-400'>Pending Payouts</span>
                <span className='text-sm font-semibold text-white'>$8,450</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-slate-400'>
                  Total Paid to Creators
                </span>
                <span className='text-sm font-semibold text-emerald'>
                  ${stats.totalPayouts.toLocaleString()}
                </span>
              </div>
            </div>
            <button className='w-full btn-primary'>Process Payouts</button>
          </div>
        </div>
      </div>
    </div>
  );
}
