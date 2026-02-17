import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { goalAPI, activityAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import DonutChart from './DonutChart';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { HiChartPie, HiChartBar, HiTrendingUp } from 'react-icons/hi';

const EnhancedCharts = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeChart, setActiveChart] = useState('donut');

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [dashboardRes, weeklyRes, monthlyRes] = await Promise.all([
                    goalAPI.getDashboard(),
                    activityAPI.getWeeklyTrends(),
                    activityAPI.getMonthlyTrends()
                ]);

                if (!mounted) return; // Component unmounted during fetch

                console.log('Dashboard data:', dashboardRes.data);
                console.log('Weekly trends:', weeklyRes.data);
                console.log('Monthly trends:', monthlyRes.data);

                setData({
                    dashboard: dashboardRes.data.dashboard || {},
                    weekly: weeklyRes.data.trends || [],
                    monthly: monthlyRes.data.trends || []
                });
            } catch (error) {
                if (!mounted) return;

                console.error('Chart data error:', error);
                toast.error('Failed to load chart data');
                setData({ dashboard: {}, weekly: [], monthly: [] });
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // Cleanup function
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return <LoadingSpinner text="Loading charts..." />;
    }

    if (!data) {
        return (
            <div className="card p-6">
                <p className="text-center text-slate-500">Unable to load charts</p>
            </div>
        );
    }

    // Prepare data for donut chart - get from monthly summary
    const monthlyData = data.dashboard?.monthly;
    const donutData = [
        { name: 'energy', value: monthlyData?.energy || 0 },
        { name: 'transport', value: monthlyData?.transport || 0 },
        { name: 'food', value: monthlyData?.food || 0 },
        { name: 'goods', value: monthlyData?.goods || 0 }
    ].filter(item => item.value > 0);

    // Prepare data for bar chart (last 7 days)
    const barData = Array.isArray(data.weekly) && data.weekly.length > 0
        ? data.weekly.slice(-7).map(day => ({
            label: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            value: day.total || 0,
            category: 'total'
        }))
        : [];

    // Prepare data for line chart (monthly trend)
    const lineData = Array.isArray(data.monthly) && data.monthly.length > 0
        ? data.monthly.slice(-30).map(day => ({
            label: new Date(day.date).getDate().toString(),
            value: day.total || 0
        }))
        : [];

    return (
        <div className="space-y-6">
            {/* Chart Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveChart('donut')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeChart === 'donut'
                            ? 'bg-eco-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    <HiChartPie className="w-5 h-5" />
                    Category Distribution
                </button>
                <button
                    onClick={() => setActiveChart('bar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeChart === 'bar'
                            ? 'bg-eco-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    <HiChartBar className="w-5 h-5" />
                    Weekly Comparison
                </button>
                <button
                    onClick={() => setActiveChart('line')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeChart === 'line'
                            ? 'bg-eco-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    <HiTrendingUp className="w-5 h-5" />
                    Monthly Trend
                </button>
            </div>

            {/* Chart Display */}
            <motion.div
                key={activeChart}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="card p-6"
            >
                {activeChart === 'donut' && (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">
                            Monthly Emissions by Category
                        </h3>
                        <div className="flex justify-center">
                            <DonutChart data={donutData} size={240} />
                        </div>
                    </div>
                )}

                {activeChart === 'bar' && (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">
                            Last 7 Days Emissions
                        </h3>
                        <BarChart data={barData} />
                    </div>
                )}

                {activeChart === 'line' && (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">
                            30-Day Emissions Trend
                        </h3>
                        <LineChart data={lineData} height={220} />
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EnhancedCharts;
