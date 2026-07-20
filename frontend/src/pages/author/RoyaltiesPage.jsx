import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiArrowUp,
  FiAward,
  FiRefreshCw,
  FiClock,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import authorService from '../../services/authService';
import { NotificationContext } from '../../contexts/NotificationContext';

export default function RoyaltiesPage() {
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState([]);
  const [totalStats, setTotalStats] = useState({
    total_earnings: 0,
    platform_fee: 0,
    total_sales: 0,
    pending_payout: 0,
  });
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchRoyalties();
  }, [timeRange]);

  const fetchRoyalties = async () => {
    setLoading(true);
    try {
      const response = await authorService.getRoyalties(timeRange);
      if (response.success) {
        setEarningsData(response.data.earnings_data || []);
        setTotalStats(response.data.total_stats);
      }
    } catch (error) {
      console.error('Error fetching royalties:', error);
      showNotification('Failed to fetch royalties data', 'error');
    } finally {
      setLoading(false);
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
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>
            Royalties
          </h1>
          <p className='text-slate-400 mt-1'>Track your earnings and payouts</p>
        </div>
        <div className='flex gap-3'>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className='px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white'
          >
            <option value='month'>Last 30 days</option>
            <option value='year'>Last 12 months</option>
          </select>
          <button
            onClick={fetchRoyalties}
            className='p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors'
          >
            <FiRefreshCw className='text-slate-400' />
          </button>
        </div>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20'>
          <div className='flex items-center justify-between mb-2'>
            <FiDollarSign className='w-8 h-8 text-amber-500' />
            <span className='text-xs text-slate-500'>Lifetime</span>
          </div>
          <p className='text-3xl font-bold text-white'>
            ${totalStats.total_earnings.toLocaleString()}
          </p>
          <p className='text-sm text-slate-400'>Total Earnings</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiTrendingUp className='w-8 h-8 text-royal-blue' />
            <span className='text-xs text-slate-500'>Total Sales</span>
          </div>
          <p className='text-3xl font-bold text-white'>
            {totalStats.total_sales}
          </p>
          <p className='text-sm text-slate-400'>Books Sold</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiAward className='w-8 h-8 text-emerald' />
            <span className='text-xs text-slate-500'>Platform Fee</span>
          </div>
          <p className='text-3xl font-bold text-white'>
            ${totalStats.platform_fee.toLocaleString()}
          </p>
          <p className='text-sm text-slate-400'>Commission (30%)</p>
        </div>

        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <div className='flex items-center justify-between mb-2'>
            <FiClock className='w-8 h-8 text-indigo' />
            <span className='text-xs text-slate-500'>Pending</span>
          </div>
          <p className='text-3xl font-bold text-white'>
            ${totalStats.pending_payout.toLocaleString()}
          </p>
          <p className='text-sm text-slate-400'>Pending Payout</p>
        </div>
      </div>

      <div className='bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Earnings Overview
        </h3>
        <ResponsiveContainer width='100%' height={350}>
          <AreaChart data={earningsData}>
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
              dataKey='earnings'
              stroke='#10B981'
              fill='#10B981'
              fillOpacity={0.2}
              name='Earnings'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='bg-gradient-to-r from-royal-blue/10 to-indigo/10 rounded-xl p-6 border border-royal-blue/20 mb-8'>
        <h3 className='text-lg font-semibold text-white mb-2'>
          How Royalties Work
        </h3>
        <div className='grid md:grid-cols-3 gap-4 text-sm'>
          <div>
            <p className='text-royal-blue font-semibold'>70%</p>
            <p className='text-slate-400'>You earn on each sale</p>
          </div>
          <div>
            <p className='text-royal-blue font-semibold'>Monthly Payouts</p>
            <p className='text-slate-400'>Paid on the 1st of each month</p>
          </div>
          <div>
            <p className='text-royal-blue font-semibold'>$50 Minimum</p>
            <p className='text-slate-400'>Minimum payout threshold</p>
          </div>
        </div>
      </div>

      <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Withdraw Earnings
        </h3>
        <div className='flex flex-wrap gap-4 items-end'>
          <div className='flex-1'>
            <label className='block text-sm font-medium text-slate-300 mb-2'>
              Amount to Withdraw
            </label>
            <div className='relative'>
              <FiDollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <input
                type='number'
                placeholder='0.00'
                className='w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-royal-blue focus:outline-none'
              />
            </div>
            <p className='text-xs text-slate-500 mt-1'>
              Available: ${totalStats.total_earnings.toLocaleString()}
            </p>
          </div>
          <select className='px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white'>
            <option>PayPal</option>
            <option>Bank Transfer</option>
            <option>Stripe</option>
          </select>
          <button className='btn-primary'>Request Withdrawal</button>
        </div>
      </div>
    </div>
  );
}
