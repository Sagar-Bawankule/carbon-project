import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FaLeaf } from 'react-icons/fa';
import {
  HiGlobeAlt,
  HiTruck,
  HiUserGroup,
  HiCake,
  HiArrowRight,
  HiArrowLeft,
} from 'react-icons/hi';

const steps = [
  {
    id: 'region',
    title: 'Where are you located?',
    description: 'This helps us calculate more accurate emission factors for your region.',
    icon: HiGlobeAlt,
  },
  {
    id: 'vehicle',
    title: 'What\'s your primary transport?',
    description: 'Tell us how you usually get around.',
    icon: HiTruck,
  },
  {
    id: 'household',
    title: 'Household size',
    description: 'How many people live in your household?',
    icon: HiUserGroup,
  },
  {
    id: 'diet',
    title: 'What\'s your diet like?',
    description: 'Diet plays a significant role in your carbon footprint.',
    icon: HiCake,
  },
];

const regions = [
  { value: 'global', label: '🌍 Global Average' },
  { value: 'north_america', label: '🇺🇸 North America' },
  { value: 'europe', label: '🇪🇺 Europe' },
  { value: 'asia', label: '🌏 Asia' },
  { value: 'australia', label: '🇦🇺 Australia' },
  { value: 'other', label: '🌐 Other' },
];

const vehicles = [
  { value: 'electric', label: '⚡ Electric Vehicle' },
  { value: 'hybrid', label: '🔋 Hybrid' },
  { value: 'petrol', label: '⛽ Petrol/Gasoline' },
  { value: 'diesel', label: '🛢️ Diesel' },
  { value: 'public', label: '🚌 Public Transit' },
  { value: 'bicycle', label: '🚲 Bicycle' },
  { value: 'none', label: '👟 Walking/None' },
];

const diets = [
  { value: 'meatHeavy', label: '🥩 Meat Heavy', desc: 'Meat with most meals' },
  { value: 'average', label: '🍽️ Average', desc: 'Mixed diet' },
  { value: 'pescatarian', label: '🐟 Pescatarian', desc: 'Fish, no meat' },
  { value: 'vegetarian', label: '🥗 Vegetarian', desc: 'No meat or fish' },
  { value: 'vegan', label: '🌱 Vegan', desc: 'Plant-based only' },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    region: 'global',
    primaryVehicle: 'petrol',
    householdSize: 1,
    dietType: 'average',
  });
  const [loading, setLoading] = useState(false);
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeOnboarding(formData);
      toast.success('Profile setup complete!');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'region':
        return (
          <div className="grid grid-cols-2 gap-3">
            {regions.map((region) => (
              <motion.button
                key={region.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({ ...formData, region: region.value })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.region === region.value
                    ? 'border-eco-500 bg-eco-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">{region.label}</span>
              </motion.button>
            ))}
          </div>
        );

      case 'vehicle':
        return (
          <div className="grid grid-cols-2 gap-3">
            {vehicles.map((vehicle) => (
              <motion.button
                key={vehicle.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({ ...formData, primaryVehicle: vehicle.value })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.primaryVehicle === vehicle.value
                    ? 'border-eco-500 bg-eco-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-base">{vehicle.label}</span>
              </motion.button>
            ))}
          </div>
        );

      case 'household':
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setFormData({
                    ...formData,
                    householdSize: Math.max(1, formData.householdSize - 1),
                  })
                }
                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 
                           flex items-center justify-center text-2xl font-medium"
              >
                -
              </motion.button>
              <div className="text-center">
                <span className="text-5xl font-bold text-eco-600">
                  {formData.householdSize}
                </span>
                <p className="text-sm text-slate-500 mt-1">
                  {formData.householdSize === 1 ? 'person' : 'people'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setFormData({
                    ...formData,
                    householdSize: Math.min(10, formData.householdSize + 1),
                  })
                }
                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 
                           flex items-center justify-center text-2xl font-medium"
              >
                +
              </motion.button>
            </div>
          </div>
        );

      case 'diet':
        return (
          <div className="space-y-3">
            {diets.map((diet) => (
              <motion.button
                key={diet.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setFormData({ ...formData, dietType: diet.value })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  formData.dietType === diet.value
                    ? 'border-eco-500 bg-eco-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-medium">{diet.label}</span>
                    <p className="text-sm text-slate-500">{diet.desc}</p>
                  </div>
                  {formData.dietType === diet.value && (
                    <span className="text-eco-500 text-xl">✓</span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'bg-eco-500 w-8' : 'bg-slate-200 w-4'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="card p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-eco-100 rounded-2xl mb-4">
                  <CurrentIcon className="w-7 h-7 text-eco-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-500 mt-1">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Content */}
              <div className="mb-8">{renderStepContent()}</div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <HiArrowLeft className="w-5 h-5" />
                  Back
                </button>

                <motion.button
                  onClick={handleNext}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    'Saving...'
                  ) : currentStep === steps.length - 1 ? (
                    <>
                      Complete Setup
                      <FaLeaf className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <HiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip option */}
        <p className="text-center text-sm text-slate-500 mt-4">
          Step {currentStep + 1} of {steps.length}
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;
