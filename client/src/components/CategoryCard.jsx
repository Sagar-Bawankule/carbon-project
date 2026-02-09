import { motion } from 'framer-motion';
import { HiLightningBolt, HiTruck, HiCake, HiShoppingBag } from 'react-icons/hi';

const categoryConfig = {
  energy: {
    icon: HiLightningBolt,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  transport: {
    icon: HiTruck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  food: {
    icon: HiCake,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  goods: {
    icon: HiShoppingBag,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
};

const CategoryCard = ({
  category,
  value,
  total,
  onClick,
  index = 0,
}) => {
  const config = categoryConfig[category] || categoryConfig.energy;
  const Icon = config.icon;
  const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`card-hover p-5 cursor-pointer ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <span className="text-xs font-medium text-slate-500">
          {percentage}%
        </span>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-600 capitalize">
          {category}
        </h3>
        <p className="text-2xl font-bold text-slate-800 mt-1">
          {value.toFixed(1)}
          <span className="text-sm font-normal text-slate-500 ml-1">
            kg CO₂e
          </span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
          className={`h-full rounded-full ${
            category === 'energy'
              ? 'bg-yellow-400'
              : category === 'transport'
              ? 'bg-blue-400'
              : category === 'food'
              ? 'bg-green-400'
              : 'bg-purple-400'
          }`}
        />
      </div>
    </motion.div>
  );
};

export default CategoryCard;
