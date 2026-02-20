import React from 'react';
import {
    BarChart as ReChartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const BarChart = ({ data, height = 300 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center bg-slate-50 rounded-lg" style={{ height }}>
                <p className="text-slate-400 text-sm">No data available for the selected period</p>
            </div>
        );
    }

    const colors = {
        energy: '#eab308',
        transport: '#3b82f6',
        food: '#22c55e',
        goods: '#a855f7',
        total: '#94a3b8'
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-xl text-sm">
                    <p className="font-bold text-slate-800 mb-1">{label}</p>
                    <p className="text-eco-600 font-semibold">
                        {payload[0].value.toFixed(2)} <span className="text-xs text-slate-500 font-normal">kg CO₂e</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <ReChartsBarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    barSize={40}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: '#f8fafc', radius: 10 }}
                    />
                    <Bar
                        dataKey="value"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={colors[entry.category] || colors.total}
                            />
                        ))}
                    </Bar>
                </ReChartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChart;
