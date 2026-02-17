import { motion } from 'framer-motion';

const BarChart = ({ data, maxValue }) => {
    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-slate-400 text-sm">No data available</p>
            </div>
        );
    }

    const colors = {
        energy: '#eab308',
        transport: '#3b82f6',
        food: '#22c55e',
        goods: '#a855f7'
    };

    const max = maxValue || Math.max(...data.map(d => d.value || 0), 1);

    return (
        <div className="w-full">
            <div className="flex items-end justify-between gap-2 h-48">
                {data.map((item, index) => {
                    const height = item.value ? (item.value / max) * 100 : 0;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            {/* Bar */}
                            <div className="w-full flex items-end h-full">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                                    className="w-full rounded-t-lg relative group cursor-pointer"
                                    style={{
                                        backgroundColor: colors[item.category] || '#94a3b8',
                                        minHeight: item.value > 0 ? '8px' : '0'
                                    }}
                                >
                                    {/* Tooltip */}
                                    {item.value > 0 && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                                                <p className="font-medium">{item.value.toFixed(1)} kg CO₂e</p>
                                                {item.category && (
                                                    <p className="text-slate-300 capitalize">{item.category}</p>
                                                )}
                                            </div>
                                            <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1 mx-auto" />
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Label */}
                            <p className="text-xs text-slate-600 text-center font-medium">
                                {item.label || ''}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BarChart;
