import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const TrendChart = ({ data, height = 300, showCategories = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center bg-slate-50 rounded-lg" style={{ height }}>
                <p className="text-slate-400 text-sm">No data available yet</p>
            </div>
        );
    }

    // Categories colors
    const colors = {
        energy: '#eab308', // yellow-500
        transport: '#3b82f6', // blue-500
        food: '#22c55e', // green-500
        goods: '#a855f7', // purple-500
        total: '#64748b' // slate-500
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
                    <p className="font-semibold text-slate-800 mb-2">{label}</p>
                    <div className="space-y-1">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-slate-600 capitalize">{entry.name}:</span>
                                </div>
                                <span className="font-medium text-slate-900">{entry.value.toFixed(1)} kg</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        {Object.keys(colors).map(key => (
                            <linearGradient key={key} id={`fade-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[key]} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={colors[key]} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-slate-600 capitalize ml-1">{value}</span>}
                    />

                    {showCategories ? (
                        <>
                            <Area
                                type="monotone"
                                dataKey="energy"
                                stackId="1"
                                stroke={colors.energy}
                                fill={`url(#fade-energy)`}
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="transport"
                                stackId="1"
                                stroke={colors.transport}
                                fill={`url(#fade-transport)`}
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="food"
                                stackId="1"
                                stroke={colors.food}
                                fill={`url(#fade-food)`}
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="goods"
                                stackId="1"
                                stroke={colors.goods}
                                fill={`url(#fade-goods)`}
                                strokeWidth={2}
                            />
                        </>
                    ) : (
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke={colors.total}
                            fill={`url(#fade-total)`}
                            strokeWidth={2}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
