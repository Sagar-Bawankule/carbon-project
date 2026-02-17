import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    HiDocumentReport,
    HiTrendingUp,
    HiTrendingDown,
    HiCheckCircle,
    HiExclamation,
    HiInformationCircle,
    HiDownload
} from 'react-icons/hi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const WeeklyReport = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await reportAPI.getWeeklyReport();
            console.log('Fetched report data:', res.data.report);
            setReport(res.data.report);
        } catch (error) {
            console.error('Fetch report error:', error);
            toast.error('Failed to load weekly report');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        try {
            console.log('Generating PDF with report:', report);

            if (!report) {
                toast.error('No report data available');
                return;
            }

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(34, 197, 94);
            doc.text('EcoTrack Weekly Report', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100, 116, 139);
            const weekNum = report.period?.weekNumber || 'N/A';
            const startDate = report.period?.startDate ? new Date(report.period.startDate).toLocaleDateString() : 'N/A';
            const endDate = report.period?.endDate ? new Date(report.period.endDate).toLocaleDateString() : 'N/A';
            doc.text(`Week ${weekNum} • ${startDate} - ${endDate}`, pageWidth / 2, 30, { align: 'center' });

            // Summary Section
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text('Key Statistics', 14, 45);

            const summaryData = [
                ['Total Emissions', `${report.summary?.totalCO2 || 0} kg CO2e`],
                ['Daily Average', `${report.summary?.dailyAverage || 0} kg/day`],
                ['Status', report.summary?.status === 'on-track' ? 'On Track' : 'Over Limit'],
                ['Trend', (report.comparison?.trend || 'stable').toUpperCase()]
            ];

            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94] }
            });

            // Category Breakdown
            let finalY = doc.lastAutoTable.finalY + 15;
            doc.text('Category Breakdown', 14, finalY);

            const categoryData = [];
            if (report.categoryBreakdown?.percentages) {
                Object.entries(report.categoryBreakdown.percentages).forEach(([category, percent]) => {
                    const value = report.categoryBreakdown[category] || 0;
                    categoryData.push([
                        category.charAt(0).toUpperCase() + category.slice(1),
                        `${(percent || 0).toFixed(1)}%`,
                        `${(value || 0).toFixed(1)} kg`
                    ]);
                });
            }

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Category', 'Percentage', 'Emissions']],
                body: categoryData.length > 0 ? categoryData : [['No data', '-', '-']],
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });

            // Top Contributors
            if (report.topContributors && report.topContributors.length > 0) {
                finalY = doc.lastAutoTable.finalY + 15;

                if (finalY > 220) {
                    doc.addPage();
                    finalY = 20;
                }

                doc.text('Top Contributors', 14, finalY);

                const contributorsData = report.topContributors.map((c, i) => [
                    `${i + 1}`,
                    (c.subCategory || 'Unknown').replace(/([A-Z])/g, ' $1').trim(),
                    c.category || 'Unknown',
                    `${c.co2 || 0} kg`
                ]);

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['#', 'Activity', 'Category', 'Impact']],
                    body: contributorsData,
                    theme: 'striped',
                    headStyles: { fillColor: [234, 179, 8] }
                });
            }

            // Recommendations
            if (report.recommendations && report.recommendations.length > 0) {
                finalY = doc.lastAutoTable.finalY + 15;

                if (finalY > 220) {
                    doc.addPage();
                    finalY = 20;
                }

                doc.text('Recommendations', 14, finalY);

                const recommendationsData = report.recommendations.map(r => [
                    r.title || 'No title',
                    r.impact || 'Medium',
                    r.description || 'No description'
                ]);

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Tip', 'Impact', 'Description']],
                    body: recommendationsData,
                    theme: 'striped',
                    headStyles: { fillColor: [168, 85, 247] },
                    columnStyles: { 2: { cellWidth: 80 } }
                });
            }

            const filename = `EcoTrack_Report_Week_${weekNum}.pdf`;
            doc.save(filename);
            toast.success(`Report downloaded! (${filename})`);
            console.log('PDF generated successfully');

        } catch (error) {
            console.error('PDF Generation Error:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            toast.error(`Failed to generate PDF: ${error.message}`);
        }
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'success':
                return <HiCheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <HiExclamation className="w-5 h-5 text-amber-500" />;
            default:
                return <HiInformationCircle className="w-5 h-5 text-blue-500" />;
        }
    };

    const getInsightStyle = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'warning':
                return 'bg-amber-50 border-amber-200 text-amber-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    if (loading) {
        return <LoadingSpinner text="Generating your weekly report..." />;
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-600">No data available for this week</p>
            </div>
        );
    }

    const { summary, comparison, categoryBreakdown, dailyBreakdown, topContributors, recommendations, insights } = report;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <HiDocumentReport className="text-eco-500" />
                            Weekly Carbon Report
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Week {report.period.weekNumber} • {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                        </p>
                    </div>
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={generatePDF}
                    >
                        <HiDownload className="w-5 h-5" />
                        Download PDF
                    </button>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-6 bg-gradient-to-br from-eco-50 to-teal-50"
                >
                    <p className="text-sm text-slate-600 mb-1">Total Emissions</p>
                    <p className="text-3xl font-bold text-eco-600">
                        {summary.totalCO2}
                        <span className="text-base font-normal text-slate-500 ml-1">kg CO₂e</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        {summary.activitiesLogged} activities logged
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-6"
                >
                    <p className="text-sm text-slate-600 mb-1">Daily Average</p>
                    <p className="text-3xl font-bold text-slate-800">
                        {summary.dailyAverage}
                        <span className="text-base font-normal text-slate-500 ml-1">kg/day</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${summary.status === 'on-track'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {summary.status === 'on-track' ? '✓ On Track' : '✗ Over Limit'}
                        </div>
                        <span className="text-xs text-slate-500">Limit: {summary.dailyLimit} kg</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-6"
                >
                    <p className="text-sm text-slate-600 mb-1">vs Last Week</p>
                    <div className="flex items-center gap-2">
                        {comparison.trend === 'decreased' ? (
                            <HiTrendingDown className="w-8 h-8 text-green-500" />
                        ) : comparison.trend === 'increased' ? (
                            <HiTrendingUp className="w-8 h-8 text-red-500" />
                        ) : (
                            <span className="text-2xl">➡️</span>
                        )}
                        <div>
                            <p className={`text-2xl font-bold ${comparison.trend === 'decreased' ? 'text-green-600' :
                                comparison.trend === 'increased' ? 'text-red-600' : 'text-slate-600'
                                }`}>
                                {comparison.change > 0 ? '+' : ''}{comparison.change}%
                            </p>
                            <p className="text-xs text-slate-500">Previous: {comparison.previousWeekTotal} kg</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Insights */}
            {insights && insights.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">💡 Key Insights</h2>
                    <div className="space-y-3">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-4 rounded-xl border ${getInsightStyle(insight.type)}`}
                            >
                                {getInsightIcon(insight.type)}
                                <p className="flex-1 text-sm">{insight.message}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Category Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card p-6 mb-6"
            >
                <h2 className="text-lg font-semibold text-slate-800 mb-4">📊 Category Breakdown</h2>
                <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(categoryBreakdown.percentages).map(([category, percentage]) => (
                        <div key={category} className="text-center">
                            <div className="relative w-20 h-20 mx-auto mb-2">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="35"
                                        fill="none"
                                        stroke="#e2e8f0"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="35"
                                        fill="none"
                                        stroke={getCategoryColor(category)}
                                        strokeWidth="8"
                                        strokeDasharray={`${(percentage / 100) * 220} 220`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-slate-700">
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-800 capitalize">{category}</p>
                            <p className="text-xs text-slate-500">{categoryBreakdown[category].toFixed(1)} kg</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Top Contributors */}
            {topContributors && topContributors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">🔝 Top 5 Contributors</h2>
                    <div className="space-y-3">
                        {topContributors.map((activity, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800 capitalize">
                                        {activity.subCategory.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {activity.category} • {activity.value} {activity.unit}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-eco-600">{activity.co2} kg</p>
                                    <p className="text-xs text-slate-500">{activity.percentage.toFixed(1)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="card p-6"
                >
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">🎯 Personalized Recommendations</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-slate-800">{rec.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full ${rec.impact === 'High' ? 'bg-red-100 text-red-700' :
                                        rec.impact === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {rec.impact}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">{rec.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Helper function
function getCategoryColor(category) {
    const colors = {
        energy: '#eab308',
        transport: '#3b82f6',
        food: '#22c55e',
        goods: '#a855f7'
    };
    return colors[category] || '#94a3b8';
}

export default WeeklyReport;
