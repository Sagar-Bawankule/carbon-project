import { motion } from 'framer-motion';

const LineChart = ({ data, height = 200 }) => {
    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-slate-400 text-sm">No data available</p>
            </div>
        );
    }

    const values = data.map(d => d.value || 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const width = 600;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((item, index) => {
        const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
        const y = padding + chartHeight - (((item.value || 0) - min) / range) * chartHeight;
        return { x, y, ...item };
    });

    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    // Create gradient area path
    const areaPath = [
        pathData,
        `L ${points[points.length - 1].x} ${height - padding}`,
        `L ${padding} ${height - padding}`,
        'Z'
    ].join(' ');

    return (
        <div className="w-full overflow-x-auto">
            <svg width={width} height={height} className="mx-auto">
                {/* Grid lines */}
                <g className="text-slate-200">
                    {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                        const y = padding + chartHeight * (1 - fraction);
                        return (
                            <g key={i}>
                                <line
                                    x1={padding}
                                    y1={y}
                                    x2={width - padding}
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={padding - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="text-xs fill-slate-400"
                                >
                                    {((min + range * fraction).toFixed(0))}
                                </text>
                            </g>
                        );
                    })}
                </g>

                {/* Gradient area */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                <motion.path
                    d={areaPath}
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />

                {/* Line */}
                <motion.path
                    d={pathData}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                />

                {/* Data points */}
                {points.map((point, index) => (
                    <g key={index}>
                        <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            fill="#fff"
                            stroke="#22c55e"
                            strokeWidth="3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className="cursor-pointer hover:r-6 transition-all"
                        />

                        {/* Date labels */}
                        <text
                            x={point.x}
                            y={height - padding + 20}
                            textAnchor="middle"
                            className="text-xs fill-slate-500"
                        >
                            {point.label || ''}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default LineChart;
