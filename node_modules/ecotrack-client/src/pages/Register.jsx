import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FaLeaf, FaGoogle, FaGithub } from 'react-icons/fa';
import { 
  HiUser,
  HiMail, 
  HiLockClosed, 
  HiEye, 
  HiEyeOff, 
  HiArrowRight,
  HiCheckCircle,
  HiShieldCheck,
  HiGlobe,
  HiHeart
} from 'react-icons/hi';

const benefits = [
  { icon: HiCheckCircle, text: 'Free forever, no credit card required' },
  { icon: HiShieldCheck, text: 'Your data is secure and private' },
  { icon: HiGlobe, text: 'Join 10,000+ eco-conscious users' },
  { icon: HiHeart, text: 'Make a real environmental impact' },
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (password.length === 0) return { width: '0%', color: 'bg-slate-200', text: '' };
    if (password.length < 6) return { width: '25%', color: 'bg-red-500', text: 'Weak' };
    if (password.length < 8) return { width: '50%', color: 'bg-amber-500', text: 'Fair' };
    if (password.length < 12) return { width: '75%', color: 'bg-eco-500', text: 'Good' };
    return { width: '100%', color: 'bg-eco-600', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
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
            <h1 className="text-3xl font-bold text-slate-800">Create your account</h1>
            <p className="text-slate-500 mt-2">Start your sustainable journey today</p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 
                         rounded-xl text-slate-700 font-medium hover:bg-slate-100 hover:border-slate-300 
                         transition-all"
            >
              <FaGoogle className="text-red-500" />
              <span className="hidden sm:inline">Google</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 
                         rounded-xl text-slate-700 font-medium hover:bg-slate-100 hover:border-slate-300 
                         transition-all"
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
              <span className="px-4 bg-white text-slate-400">or register with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative group">
                <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 
                                   group-focus-within:text-eco-500 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl
                             text-slate-800 placeholder-slate-400 transition-all
                             focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500
                             focus:bg-white hover:border-slate-300"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl
                             text-slate-800 placeholder-slate-400 transition-all
                             focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500
                             focus:bg-white hover:border-slate-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 
                                         group-focus-within:text-eco-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl
                             text-slate-800 placeholder-slate-400 transition-all
                             focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500
                             focus:bg-white hover:border-slate-300"
                  placeholder="Create a strong password"
                  required
                  minLength={6}
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
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: passwordStrength.width }}
                        className={`h-full ${passwordStrength.color} rounded-full`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.color === 'bg-red-500' ? 'text-red-500' :
                      passwordStrength.color === 'bg-amber-500' ? 'text-amber-500' : 'text-eco-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 
                                         group-focus-within:text-eco-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl
                             text-slate-800 placeholder-slate-400 transition-all
                             focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500
                             focus:bg-white hover:border-slate-300
                             ${confirmPassword && confirmPassword !== password 
                               ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                               : confirmPassword && confirmPassword === password 
                                 ? 'border-eco-300 focus:border-eco-500' 
                                 : 'border-slate-200'}`}
                  placeholder="Confirm your password"
                  required
                />
                {confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {confirmPassword === password ? (
                      <HiCheckCircle className="w-5 h-5 text-eco-500" />
                    ) : (
                      <span className="text-xs text-red-500">No match</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-eco-500 focus:ring-eco-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                I agree to the{' '}
                <a href="#" className="text-eco-600 hover:text-eco-700 font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-eco-600 hover:text-eco-700 font-medium">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !agreedToTerms}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-eco-500 to-eco-600 
                         text-white font-semibold rounded-xl shadow-lg shadow-eco-500/30
                         hover:from-eco-600 hover:to-eco-700 hover:shadow-eco-500/40
                         disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <HiArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-eco-600 hover:text-eco-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-eco-500 to-eco-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              y: [0, -40, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 right-1/4 w-48 h-48 border-2 border-white/20 rounded-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
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
              Start Making a
              <br />
              <span className="text-eco-100">Difference Today</span>
            </h2>

            <p className="text-eco-100 text-lg mb-10 max-w-md">
              Every small action counts. Track your carbon footprint and discover 
              how your daily choices impact the planet.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <span>{benefit.text}</span>
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
    </div>
  );
};

export default Register;
