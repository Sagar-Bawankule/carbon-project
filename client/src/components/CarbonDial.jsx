import { motion } from 'framer-motion';
import { useMemo } from 'react';

const CarbonDial = ({
  current = 0,
  limit = 500,
  label = 'Monthly',
  size = 'lg',
}) => {
  const percentage = useMemo(() => {
    return Math.min((current / limit) * 100, 100);
  }, [current, limit]);

  const status = useMemo(() => {
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'within';
  }, [percentage]);

  const colors = {
    within: { stroke: '#22c55e', bg: '#f0fdf4', text: 'text-eco-600' },
    warning: { stroke: '#f59e0b', bg: '#fffbeb', text: 'text-amber-600' },
    exceeded: { stroke: '#ef4444', bg: '#fef2f2', text: 'text-red-600' },
  };

  const sizes = {
    sm: { diameter: 120, stroke: 8, fontSize: 'text-lg' },
    md: { diameter: 160, stroke: 10, fontSize: 'text-2xl' },
    lg: { diameter: 200, stroke: 12, fontSize: 'text-3xl' },
  };

  const config = sizes[size];
  const radius = (config.diameter - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
        {/* Background circle */}
        <svg
          width={config.diameter}
          height={config.diameter}
          className="transform -rotate-90"
        >
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={config.stroke}
          />
          <motion.circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={colors[status].stroke}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${config.fontSize} font-bold ${colors[status].text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {current.toFixed(1)}
          </motion.span>
          <span className="text-xs text-slate-500">kg CO₂e</span>
        </div>
      </div>

      {/* Label and limit */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-slate-700">{label} Carbon</p>
        <p className="text-xs text-slate-500">
          Limit: {limit} kg CO₂e • {percentage.toFixed(0)}%
        </p>
      </div>

      {/* Status badge */}
      <motion.div
        className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
          status === 'within'
            ? 'bg-eco-100 text-eco-700'
            : status === 'warning'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-700'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {status === 'within' && '✓ On Track'}
        {status === 'warning' && '⚠ Approaching Limit'}
        {status === 'exceeded' && '✕ Exceeded'}
      </motion.div>
    </motion.div>
  );
};

export default CarbonDial;
