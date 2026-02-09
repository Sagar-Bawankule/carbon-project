import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { activityAPI, goalAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiLightningBolt,
  HiTruck,
  HiCake,
  HiShoppingBag,
  HiCheck,
  HiArrowRight,
  HiArrowLeft,
} from 'react-icons/hi';

const categories = [
  {
    id: 'energy',
    name: 'Energy',
    icon: HiLightningBolt,
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    subCategories: [
      { id: 'electricity', name: 'Electricity', unit: 'kWh', placeholder: 'Enter kWh used' },
      { id: 'naturalGas', name: 'Natural Gas', unit: 'm³', placeholder: 'Enter cubic meters' },
      { id: 'heatingOil', name: 'Heating Oil', unit: 'liters', placeholder: 'Enter liters' },
      { id: 'propane', name: 'Propane', unit: 'liters', placeholder: 'Enter liters' },
    ],
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: HiTruck,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    subCategories: [
      { id: 'electric', name: 'Electric Vehicle', unit: 'km', placeholder: 'Distance in km' },
      { id: 'hybrid', name: 'Hybrid', unit: 'km', placeholder: 'Distance in km' },
      { id: 'petrol', name: 'Petrol Car', unit: 'km', placeholder: 'Distance in km' },
      { id: 'diesel', name: 'Diesel Car', unit: 'km', placeholder: 'Distance in km' },
      { id: 'motorcycle', name: 'Motorcycle', unit: 'km', placeholder: 'Distance in km' },
      { id: 'bus', name: 'Bus', unit: 'km', placeholder: 'Distance in km' },
      { id: 'train', name: 'Train/Metro', unit: 'km', placeholder: 'Distance in km' },
      { id: 'flight_short', name: 'Flight (Short)', unit: 'km', placeholder: 'Distance in km' },
      { id: 'flight_long', name: 'Flight (Long)', unit: 'km', placeholder: 'Distance in km' },
    ],
  },
  {
    id: 'food',
    name: 'Food',
    icon: HiCake,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    subCategories: [
      { id: 'beef', name: 'Beef', unit: 'kg', placeholder: 'Amount in kg' },
      { id: 'lamb', name: 'Lamb', unit: 'kg', placeholder: 'Amount in kg' },
      { id: 'pork', name: 'Pork', unit: 'kg', placeholder: 'Amount in kg' },
      { id: 'chicken', name: 'Chicken', unit: 'kg', placeholder: 'Amount in kg' },
      { id: 'fish', name: 'Fish', unit: 'kg', placeholder: 'Amount in kg' },
      { id: 'dairy', name: 'Dairy', unit: 'kg', placeholder: 'Amount in kg' },
      { id: 'cheese', name: 'Cheese', unit: 'kg', placeholder: 'Amount in kg' },
      { id: 'vegetables', name: 'Vegetables', unit: 'kg', placeholder: 'Amount in kg' },
      { id: 'meatHeavy', name: 'Meat-Heavy Day', unit: 'days', placeholder: 'Number of days' },
      { id: 'vegan', name: 'Vegan Day', unit: 'days', placeholder: 'Number of days' },
    ],
  },
  {
    id: 'goods',
    name: 'Shopping',
    icon: HiShoppingBag,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    subCategories: [
      { id: 'clothing', name: 'Clothing', unit: '$', placeholder: 'Amount spent' },
      { id: 'electronics', name: 'Electronics', unit: '$', placeholder: 'Amount spent' },
      { id: 'furniture', name: 'Furniture', unit: '$', placeholder: 'Amount spent' },
      { id: 'household', name: 'Household Items', unit: '$', placeholder: 'Amount spent' },
      { id: 'personalCare', name: 'Personal Care', unit: '$', placeholder: 'Amount spent' },
      { id: 'entertainment', name: 'Entertainment', unit: '$', placeholder: 'Amount spent' },
      { id: 'other', name: 'Other', unit: '$', placeholder: 'Amount spent' },
    ],
  },
];

const InputActivity = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [emissionFactors, setEmissionFactors] = useState(null);
  const [estimatedCO2, setEstimatedCO2] = useState(0);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const cat = categories.find((c) => c.id === categoryParam);
      if (cat) {
        setSelectedCategory(cat);
        setStep(2);
      }
    }
    fetchEmissionFactors();
  }, [searchParams]);

  useEffect(() => {
    // Calculate estimated CO2 as user types
    if (selectedCategory && selectedSubCategory && value && emissionFactors) {
      calculateEstimate();
    }
  }, [value, selectedSubCategory]);

  const fetchEmissionFactors = async () => {
    try {
      const res = await goalAPI.getEmissionFactors();
      setEmissionFactors(res.data.factors);
    } catch (error) {
      console.error('Failed to fetch emission factors:', error);
    }
  };

  const calculateEstimate = () => {
    if (!emissionFactors || !selectedCategory || !selectedSubCategory || !value) {
      setEstimatedCO2(0);
      return;
    }

    let factor = 0;
    const numValue = parseFloat(value) || 0;

    switch (selectedCategory.id) {
      case 'energy':
        if (selectedSubCategory.id === 'electricity') {
          factor = emissionFactors.electricity;
        } else if (selectedSubCategory.id === 'naturalGas') {
          factor = emissionFactors.naturalGas;
        } else if (selectedSubCategory.id === 'heatingOil') {
          factor = emissionFactors.heatingOil;
        } else if (selectedSubCategory.id === 'propane') {
          factor = emissionFactors.propane;
        }
        break;
      case 'transport':
        factor = emissionFactors.transport?.[selectedSubCategory.id] || 0;
        break;
      case 'food':
        factor = emissionFactors.food?.[selectedSubCategory.id] || 
                 emissionFactors.dietTypes?.[selectedSubCategory.id] || 0;
        break;
      case 'goods':
        factor = emissionFactors.goods?.[selectedSubCategory.id] || 0;
        break;
    }

    setEstimatedCO2(Math.round(numValue * factor * 100) / 100);
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !selectedSubCategory || !value) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await activityAPI.create({
        category: selectedCategory.id,
        subCategory: selectedSubCategory.id,
        value: parseFloat(value),
        unit: selectedSubCategory.unit,
        date,
        notes,
      });

      toast.success(
        <div>
          <strong>Activity logged!</strong>
          <p className="text-sm">{estimatedCO2} kg CO₂e added to your footprint</p>
        </div>
      );

      // Reset form
      setStep(1);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setValue('');
      setNotes('');
      setEstimatedCO2(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              What type of activity?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setStep(2);
                    }}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      selectedCategory?.id === cat.id
                        ? 'border-eco-500 bg-eco-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-12 h-12 ${cat.lightColor} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 ${cat.color.replace('bg-', 'text-')}`} />
                    </div>
                    <h3 className="font-semibold text-slate-800">{cat.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {cat.subCategories.length} options
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Select {selectedCategory?.name} Type
            </h2>
            <p className="text-slate-500 mb-6">Choose the specific activity</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {selectedCategory?.subCategories.map((sub, index) => (
                <motion.button
                  key={sub.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSubCategory(sub);
                    setStep(3);
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedSubCategory?.id === sub.id
                      ? 'border-eco-500 bg-eco-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <h4 className="font-medium text-slate-800">{sub.name}</h4>
                  <span className="text-sm text-slate-500">{sub.unit}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Enter Details
            </h2>
            <p className="text-slate-500 mb-6">
              {selectedCategory?.name} → {selectedSubCategory?.name}
            </p>

            <div className="space-y-5">
              {/* Value Input */}
              <div>
                <label className="label">Amount ({selectedSubCategory?.unit})</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="input text-lg"
                  placeholder={selectedSubCategory?.placeholder}
                  min="0"
                  step="any"
                  autoFocus
                />
              </div>

              {/* Estimated CO2 */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: value ? 1 : 0, height: value ? 'auto' : 0 }}
                className="p-4 bg-eco-50 rounded-xl border border-eco-200"
              >
                <p className="text-sm text-eco-700">Estimated Impact</p>
                <p className="text-2xl font-bold text-eco-600">
                  {estimatedCO2} <span className="text-base font-normal">kg CO₂e</span>
                </p>
              </motion.div>

              {/* Date */}
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="Any additional details..."
                />
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Log Activity
        </h1>
        <p className="text-slate-500 mt-1">
          Track your daily carbon footprint
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s <= step ? 'bg-eco-500 w-8' : 'bg-slate-200 w-4'
            }`}
          />
        ))}
      </div>

      {/* Form Card */}
      <div className="card p-6 md:p-8">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigate('/app/dashboard');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
            Back
          </button>

          {step === 3 ? (
            <motion.button
              onClick={handleSubmit}
              disabled={loading || !value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <HiCheck className="w-5 h-5" />
                  Log Activity
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !selectedCategory : !selectedSubCategory}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              Continue
              <HiArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputActivity;
