import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FaLeaf, FaGoogle, FaGithub } from 'react-icons/fa';
import { 
  HiMail, 
  HiLockClosed, 
  HiEye, 
  HiEyeOff, 
  HiArrowRight,
  HiLightningBolt,
  HiChartBar,
  HiSparkles
} from 'react-icons/hi';

const features = [
  { icon: HiLightningBolt, text: 'Track emissions in real-time' },
  { icon: HiChartBar, text: 'Beautiful analytics dashboard' },
  { icon: HiSparkles, text: 'AI-powered recommendations' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-eco-500 via-eco-600 to-teal-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 -right-20 w-60 h-60 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, -20, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-3xl rotate-12"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <FaLeaf className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold text-white">EcoTrack</span>
            </Link>

            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Track Your
              <br />
              <span className="text-eco-200">Carbon Footprint</span>
            </h2>

            <p className="text-eco-100 text-lg mb-10 max-w-md">
              Join thousands of eco-conscious individuals making a difference, 
              one action at a time.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom decoration */}
          <div className="absolute bottom-8 left-12 xl:left-20 text-white/40 text-sm">
            © 2026 EcoTrack. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-eco-500 rounded-xl flex items-center justify-center">
                <FaLeaf className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-slate-800">EcoTrack</span>
            </Link>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-slate-500 mt-2">Sign in to continue to your dashboard</p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 
                         rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 
                         transition-all shadow-sm"
            >
              <FaGoogle className="text-red-500" />
              <span className="hidden sm:inline">Google</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 
                         rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 
                         transition-all shadow-sm"
            >
              <FaGithub className="text-slate-800" />
              <span className="hidden sm:inline">GitHub</span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-50 text-slate-400">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 
                                   group-focus-within:text-eco-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl
                             text-slate-800 placeholder-slate-400 transition-all
                             focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500
                             hover:border-slate-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <a href="#" className="text-sm text-eco-600 hover:text-eco-700 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 
                                         group-focus-within:text-eco-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl
                             text-slate-800 placeholder-slate-400 transition-all
                             focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500
                             hover:border-slate-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 
                             hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-eco-500 focus:ring-eco-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-slate-600">
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-eco-500 to-eco-600 
                         text-white font-semibold rounded-xl shadow-lg shadow-eco-500/30
                         hover:from-eco-600 hover:to-eco-700 hover:shadow-eco-500/40
                         disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <HiArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-eco-600 hover:text-eco-700 transition-colors"
            >
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
