import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { activityAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiClock,
  HiFilter,
  HiTrash,
  HiLightningBolt,
  HiTruck,
  HiCake,
  HiShoppingBag,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi';

const categoryIcons = {
  energy: { icon: HiLightningBolt, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  transport: { icon: HiTruck, color: 'text-blue-500', bg: 'bg-blue-50' },
  food: { icon: HiCake, color: 'text-green-500', bg: 'bg-green-50' },
  goods: { icon: HiShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50' },
};

const History = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [filter, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };
      if (filter !== 'all') {
        params.category = filter;
      }

      const res = await activityAPI.getAll(params);
      setActivities(res.data.activities);
      setTotalPages(res.data.pages);
    } catch (error) {
      toast.error('Failed to load activities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await activityAPI.delete(id);
      toast.success('Activity deleted');
      setDeleteId(null);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <HiClock className="text-eco-500" />
            Activity History
          </h1>
          <p className="text-slate-500 mt-1">View and manage your logged activities</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <HiFilter className="text-slate-400" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="select py-2 px-4 pr-8"
          >
            <option value="all">All Categories</option>
            <option value="energy">Energy</option>
            <option value="transport">Transport</option>
            <option value="food">Food</option>
            <option value="goods">Shopping</option>
          </select>
        </div>
      </motion.div>

      {/* Activities List */}
      {loading ? (
        <LoadingSpinner text="Loading activities..." />
      ) : activities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <HiClock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No activities yet</h3>
          <p className="text-slate-500 mt-1">
            Start logging your daily activities to track your carbon footprint
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {activities.map((activity, index) => {
              const catConfig = categoryIcons[activity.category] || categoryIcons.energy;
              const Icon = catConfig.icon;

              return (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-4 md:p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${catConfig.bg}`}>
                      <Icon className={`w-6 h-6 ${catConfig.color}`} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-slate-800 capitalize">
                            {activity.subCategory.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {activity.value} {activity.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-800">
                            {activity.calculatedCO2.toFixed(2)}
                            <span className="text-sm font-normal text-slate-500 ml-1">
                              kg CO₂e
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Date & Notes */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{formatDate(activity.date)}</span>
                          {activity.notes && (
                            <span className="text-slate-400 truncate max-w-[200px]">
                              "{activity.notes}"
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteId(activity._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-eco-500 text-white'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-slate-800">Delete Activity?</h3>
              <p className="text-slate-500 mt-2">
                This action cannot be undone. The activity will be permanently removed.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="btn flex-1 bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
