import React from 'react';
import { motion } from 'framer-motion';
import { HiFire, HiSparkles } from 'react-icons/hi';

const StreakCard = ({ streak }) => {
    const { current = 0, longest = 0, badges = [] } = streak || {};

    return (
        <div className="card p-6 relative overflow-hidden mb-6">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-xl" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-red-100 rounded-full opacity-50 blur-xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <HiFire className="w-6 h-6 text-orange-500 animate-pulse" />
                        Eco-Streak
                    </h3>
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                        <span className="text-xs font-medium text-orange-700">Longest: {longest} days</span>
                    </div>
                </div>

                <div className="flex flex-col items-center py-4">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        className="text-5xl font-bold text-slate-800 flex items-center gap-2"
                    >
                        {current}
                        <span className="text-xl font-medium text-slate-500 mt-4">days</span>
                    </motion.div>
                    <p className="text-sm text-slate-500 mt-2 text-center">
                        {current > 0
                            ? "Keep logging daily to maintain your fire!"
                            : "Log an activity today to start your streak!"}
                    </p>
                </div>

                {/* Badges Section */}
                {badges && badges.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1">
                            <HiSparkles className="w-4 h-4 text-yellow-500" />
                            Eco-Warrior Badges
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {badges.includes('7-day-streak') && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200" title="7 Day Streak">
                                    🔥 7 Days
                                </span>
                            )}
                            {badges.includes('30-day-streak') && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200" title="30 Day Streak">
                                    🚀 30 Days
                                </span>
                            )}
                            {badges.includes('100-day-streak') && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200" title="100 Day Streak">
                                    👑 100 Days
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StreakCard;
