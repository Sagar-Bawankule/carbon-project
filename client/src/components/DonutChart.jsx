import { motion } from 'framer-motion';

const DonutChart = ({ data, size = 200 }) => {
    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-slate-400 text-sm">No data available</p>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-slate-400 text-sm">No emissions recorded</p>
            </div>
        );
    }

    let currentAngle = 0;

    const colors = {
        energy: '#eab308',
        transport: '#3b82f6',
        food: '#22c55e',
        goods: '#a855f7'
    };

    const paths = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        currentAngle = endAngle;

        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const radius = size / 2;
        const innerRadius = radius * 0.6;

        const x1 = radius + radius * Math.cos(startRad);
        const y1 = radius + radius * Math.sin(startRad);
        const x2 = radius + radius * Math.cos(endRad);
        const y2 = radius + radius * Math.sin(endRad);

        const x3 = radius + innerRadius * Math.cos(endRad);
        const y3 = radius + innerRadius * Math.sin(endRad);
        const x4 = radius + innerRadius * Math.cos(startRad);
        const y4 = radius + innerRadius * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
            'Z'
        ].join(' ');

        return {
            path: pathData,
            color: colors[item.name] || '#94a3b8',
            percentage,
            ...item
        };
    });

    return (
        <div className="flex items-center gap-8">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {paths.map((segment, index) => (
                        <motion.path
                            key={index}
                            d={segment.path}
                            fill={segment.color}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                    ))}
                </svg>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-slate-800">{total.toFixed(0)}</p>
                    <p className="text-xs text-slate-500">kg CO₂e</p>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {paths.map((segment, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-sm"
                            style={{ backgroundColor: segment.color }}
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700 capitalize">{segment.name}</p>
                            <p className="text-xs text-slate-500">{segment.percentage.toFixed(1)}%</p>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{segment.value.toFixed(1)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
