import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { goalAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import RecommendationCard from '../components/RecommendationCard';
import {
  HiLightBulb,
  HiLightningBolt,
  HiTruck,
  HiCake,
  HiShoppingBag,
  HiSparkles,
} from 'react-icons/hi';

const allRecommendations = {
  energy: {
    title: 'Energy',
    icon: HiLightningBolt,
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    tips: [
      { title: 'Switch to LED Bulbs', description: 'LED bulbs use 75% less energy than incandescent lighting and last 25 times longer.', impact: 'Save up to 50 kg CO₂e/year' },
      { title: 'Unplug Idle Devices', description: 'Phantom power from devices on standby can account for 10% of your energy bill.', impact: 'Save up to 30 kg CO₂e/year' },
      { title: 'Adjust Thermostat', description: 'Lowering your heating by just 1°C can reduce your energy consumption by 10%.', impact: 'Save up to 100 kg CO₂e/year' },
      { title: 'Use Smart Power Strips', description: 'Automatically cut power to devices in standby mode to eliminate phantom loads.', impact: 'Save up to 40 kg CO₂e/year' },
      { title: 'Air Dry Clothes', description: 'Skip the dryer when possible. Clothes dryers are one of the most energy-hungry appliances.', impact: 'Save up to 60 kg CO₂e/year' },
      { title: 'Upgrade to Energy Star', description: 'Energy Star appliances use 10-50% less energy than standard models.', impact: 'Significant long-term savings' },
    ],
  },
  transport: {
    title: 'Transport',
    icon: HiTruck,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    tips: [
      { title: 'Consider Carpooling', description: 'Sharing rides with others can cut your per-person emissions by 50% or more.', impact: 'Reduce transport emissions by 50%' },
      { title: 'Use Public Transit', description: 'Buses and trains produce far less CO₂ per passenger-kilometer than cars.', impact: 'Save up to 2 kg CO₂e per trip' },
      { title: 'Explore Electric Vehicles', description: 'EVs produce zero direct emissions and have lower lifetime carbon footprints.', impact: 'Reduce transport emissions by 70%' },
      { title: 'Combine Errands', description: 'Plan your trips to accomplish multiple errands in one journey.', impact: 'Save up to 20 kg CO₂e/month' },
      { title: 'Eco-Driving Techniques', description: 'Smooth acceleration, maintaining tire pressure, and steady speeds improve fuel economy.', impact: 'Improve fuel economy by 15%' },
      { title: 'Work From Home', description: 'When possible, remote work eliminates commute emissions entirely.', impact: 'Save 3-5 kg CO₂e per day' },
    ],
  },
  food: {
    title: 'Food',
    icon: HiCake,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    tips: [
      { title: 'Try Meatless Mondays', description: 'Reducing meat consumption one day a week can make a significant difference.', impact: 'Save up to 200 kg CO₂e/year' },
      { title: 'Choose Local Produce', description: 'Locally sourced food reduces transportation emissions and supports local farmers.', impact: 'Reduce food emissions by 10%' },
      { title: 'Reduce Food Waste', description: 'Plan meals, use leftovers creatively, and compost scraps when possible.', impact: 'Save up to 100 kg CO₂e/year' },
      { title: 'Explore Plant-Based Options', description: 'Plant proteins like legumes have a fraction of the carbon footprint of meat.', impact: 'Save 2-5 kg CO₂e per meal' },
      { title: 'Seasonal Eating', description: 'In-season produce requires less energy for growing and transportation.', impact: 'Reduce food emissions by 5%' },
      { title: 'Minimize Dairy', description: 'Dairy production, especially cheese, has a significant carbon footprint.', impact: 'Save up to 100 kg CO₂e/year' },
    ],
  },
  goods: {
    title: 'Shopping',
    icon: HiShoppingBag,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    tips: [
      { title: 'Buy Second-Hand', description: 'Pre-owned items require no new manufacturing emissions and extend product life.', impact: 'Save 70-90% of item emissions' },
      { title: 'Choose Quality Over Quantity', description: 'Durable goods last longer, reducing the need for replacements.', impact: 'Reduce goods emissions by 30%' },
      { title: 'Repair Before Replacing', description: 'Extending product life through repair is better than buying new or recycling.', impact: 'Save manufacturing emissions' },
      { title: 'Avoid Fast Fashion', description: 'Quality clothing lasts years, not seasons. Fewer purchases mean less waste.', impact: 'Save up to 50 kg CO₂e/year' },
      { title: 'Digital Over Physical', description: 'E-books, streaming, and digital products reduce material consumption.', impact: 'Reduce product emissions' },
      { title: 'Minimal Packaging', description: 'Choose products with less packaging or buy in bulk when practical.', impact: 'Reduce waste and emissions' },
    ],
  },
};

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await goalAPI.getDashboard();
      setDashboardData(res.data.dashboard);
    } catch (error) {
      toast.error('Failed to load recommendations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Generating recommendations..." />;
  }

  const categories = Object.keys(allRecommendations);
  const personalizedRecs = dashboardData?.recommendations || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <HiLightBulb className="text-amber-500" />
          Recommendations
        </h1>
        <p className="text-slate-500 mt-1">
          Personalized tips to reduce your carbon footprint
        </p>
      </motion.div>

      {/* Personalized Section */}
      {personalizedRecs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <HiSparkles className="text-eco-500" />
            <h2 className="text-lg font-semibold text-slate-800">
              Personalized for You
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {personalizedRecs.map((rec, index) => (
              <RecommendationCard
                key={index}
                title={rec.title}
                description={rec.description}
                impact={rec.impact}
                category={rec.category}
                priority={rec.priority}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-eco-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Tips
        </button>
        {categories.map((cat) => {
          const config = allRecommendations[cat];
          const Icon = config.icon;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === cat
                  ? `${config.color} text-white`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.title}
            </button>
          );
        })}
      </div>

      {/* All Recommendations by Category */}
      <div className="space-y-8">
        {categories
          .filter((cat) => activeCategory === 'all' || activeCategory === cat)
          .map((cat) => {
            const config = allRecommendations[cat];
            const Icon = config.icon;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${config.lightColor}`}>
                    <Icon className={`w-6 h-6 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {config.title} Tips
                    </h2>
                    <p className="text-sm text-slate-500">
                      {config.tips.length} recommendations
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {config.tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <h4 className="font-medium text-slate-800">{tip.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{tip.description}</p>
                      <p className="text-xs font-medium text-eco-600 mt-2">
                        💪 {tip.impact}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Carbon Budget Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6 mt-8 bg-gradient-to-br from-eco-50 to-white border-eco-200"
      >
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          🎯 Setting Your Carbon Budget
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-white rounded-xl">
            <p className="text-2xl font-bold text-eco-600">500 kg</p>
            <p className="text-sm text-slate-600">Sustainable monthly target</p>
          </div>
          <div className="p-4 bg-white rounded-xl">
            <p className="text-2xl font-bold text-amber-600">750 kg</p>
            <p className="text-sm text-slate-600">Average monthly footprint</p>
          </div>
          <div className="p-4 bg-white rounded-xl">
            <p className="text-2xl font-bold text-red-600">1000+ kg</p>
            <p className="text-sm text-slate-600">High impact lifestyle</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          The Paris Agreement targets require reducing personal emissions to about 2 tonnes CO₂e per year
          (approximately 170 kg per month) by 2050. Start with achievable goals and gradually reduce.
        </p>
      </motion.div>
    </div>
  );
};

export default Recommendations;
