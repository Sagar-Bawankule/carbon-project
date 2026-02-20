import React from 'react';
import { motion } from 'framer-motion';
import { HiLightningBolt, HiTruck, HiCake, HiShoppingBag, HiArrowRight } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';

const categoryConfig = {
    energy: {
        icon: HiLightningBolt,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
    },
    transport: {
        icon: HiTruck,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
    },
    food: {
        icon: HiCake,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
    },
    goods: {
        icon: HiShoppingBag,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
    },
};

const RecentActivities = ({ activities }) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
                <p className="text-slate-500 text-sm">No recent activities found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
                <button className="text-sm text-eco-600 hover:text-eco-700 font-medium flex items-center gap-1">
                    View All <HiArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                {activities.map((activity, index) => {
                    const config = categoryConfig[activity.category] || categoryConfig.energy;
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={activity._id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <div className={`p-2 rounded-full ${config.bgColor}`}>
                                <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {activity.subCategory || activity.category}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">
                                    {typeof activity.calculatedCO2 === 'number' ? activity.calculatedCO2.toFixed(2) : '0.00'}
                                </p>
                                <p className="text-xs text-slate-500">kg CO₂e</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentActivities;
