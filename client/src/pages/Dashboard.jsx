import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { goalAPI, activityAPI } from '../services/api';
import toast from 'react-hot-toast';

// Components
import CarbonDial from '../components/CarbonDial';
import CategoryCard from '../components/CategoryCard';
import RecommendationCard from '../components/RecommendationCard';
import TrendChart from '../components/TrendChart';
import LoadingSpinner from '../components/LoadingSpinner';
import EnhancedCharts from '../components/EnhancedCharts';

import {
  HiTrendingUp,
  HiTrendingDown,
  HiPlusCircle,
  HiChartBar,
  HiCalendar,
} from 'react-icons/hi';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [chartView, setChartView] = useState('weekly');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, trendsRes] = await Promise.all([
        goalAPI.getDashboard(),
        chartView === 'weekly'
          ? activityAPI.getWeeklyTrends()
          : activityAPI.getMonthlyTrends(),
      ]);

      setDashboardData(dashboardRes.data.dashboard);
      setWeeklyTrends(trendsRes.data.trends || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChartViewChange = async (view) => {
    setChartView(view);
    try {
      const trendsRes =
        view === 'weekly'
          ? await activityAPI.getWeeklyTrends()
          : await activityAPI.getMonthlyTrends();
      setWeeklyTrends(trendsRes.data.trends || []);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  const { goal, today, monthly, recommendations } = dashboardData || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Track your carbon footprint at a glance
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/app/input')}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlusCircle className="w-5 h-5" />
          Log Activity
        </motion.button>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carbon Dial Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 card p-6 flex flex-col items-center justify-center"
        >
          <CarbonDial
            current={goal?.currentTotal || 0}
            limit={goal?.monthlyLimit || 500}
            label="Monthly"
            size="lg"
          />

          {/* Comparison */}
          {monthly && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              {monthly.comparison >= 0 ? (
                <>
                  <HiTrendingUp className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">
                    {monthly.comparison}% more
                  </span>
                </>
              ) : (
                <>
                  <HiTrendingDown className="w-5 h-5 text-eco-500" />
                  <span className="text-eco-600 font-medium">
                    {Math.abs(monthly.comparison)}% less
                  </span>
                </>
              )}
              <span className="text-slate-500">than last month</span>
            </div>
          )}
        </motion.div>

        {/* Today's Summary & Categories */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Today's Quick Stats */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <HiCalendar className="w-5 h-5 text-eco-500" />
                Today's Impact
              </h2>
              <span className="text-sm text-slate-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-3xl font-bold text-slate-800">
                  {(today?.total || 0).toFixed(1)}
                  <span className="text-base font-normal text-slate-500 ml-1">
                    kg CO₂e
                  </span>
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Daily limit: {today?.dailyLimit || 17} kg CO₂e
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${(today?.percentage || 0) <= 100
                    ? 'bg-eco-100 text-eco-700'
                    : 'bg-red-100 text-red-700'
                    }`}
                >
                  {today?.percentage || 0}% of daily
                </span>
              </div>
            </div>

            {/* Daily Progress Bar */}
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(today?.percentage || 0, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${(today?.percentage || 0) <= 80
                  ? 'bg-eco-500'
                  : (today?.percentage || 0) <= 100
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                  }`}
              />
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CategoryCard
              category="energy"
              value={monthly?.energy || 0}
              total={monthly?.total || 1}
              index={0}
              onClick={() => navigate('/app/input?category=energy')}
            />
            <CategoryCard
              category="transport"
              value={monthly?.transport || 0}
              total={monthly?.total || 1}
              index={1}
              onClick={() => navigate('/app/input?category=transport')}
            />
            <CategoryCard
              category="food"
              value={monthly?.food || 0}
              total={monthly?.total || 1}
              index={2}
              onClick={() => navigate('/app/input?category=food')}
            />
            <CategoryCard
              category="goods"
              value={monthly?.goods || 0}
              total={monthly?.total || 1}
              index={3}
              onClick={() => navigate('/app/input?category=goods')}
            />
          </div>
        </motion.div>
      </div>

      {/* Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <HiChartBar className="w-5 h-5 text-eco-500" />
            Emission Trends
          </h2>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => handleChartViewChange('weekly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${chartView === 'weekly'
                ? 'bg-white text-eco-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              7 Days
            </button>
            <button
              onClick={() => handleChartViewChange('monthly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${chartView === 'monthly'
                ? 'bg-white text-eco-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {weeklyTrends.length > 0 ? (
          <TrendChart data={weeklyTrends} height={300} showCategories={true} />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            <div className="text-center">
              <HiChartBar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No data yet. Start logging activities!</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Enhanced Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <EnhancedCharts />
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            💡 Smart Recommendations
          </h2>
          <button
            onClick={() => navigate('/app/recommendations')}
            className="text-sm text-eco-600 hover:text-eco-700 font-medium"
          >
            View all →
          </button>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((rec, index) => (
              <RecommendationCard
                key={index}
                title={rec.title}
                description={rec.description}
                impact={rec.impact}
                category={rec.category}
                priority={rec.priority}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p>Start logging activities to get personalized recommendations!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
