import { motion } from 'framer-motion';
import { HiLightBulb, HiArrowRight } from 'react-icons/hi';

const priorityColors = {
  high: 'border-l-red-500 bg-red-50',
  medium: 'border-l-amber-500 bg-amber-50',
  low: 'border-l-eco-500 bg-eco-50',
};

const RecommendationCard = ({
  title,
  description,
  impact,
  category,
  priority = 'low',
  index = 0,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`card p-4 border-l-4 cursor-pointer ${
        priorityColors[priority] || priorityColors.low
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <HiLightBulb className="w-5 h-5 text-amber-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
            {category && (
              <span className="text-xs px-2 py-0.5 bg-white rounded-full text-slate-500 capitalize">
                {category}
              </span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
            {description}
          </p>
          
          {impact && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs font-medium text-eco-600">
                💪 {impact}
              </span>
            </div>
          )}
        </div>

        <HiArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
      </div>
    </motion.div>
  );
};

export default RecommendationCard;
