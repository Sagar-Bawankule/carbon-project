import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaChartLine, FaLightbulb, FaMobileAlt } from 'react-icons/fa';
import {
  HiArrowRight,
  HiLightningBolt,
  HiTruck,
  HiCake,
  HiShoppingBag,
  HiCheckCircle,
  HiStar,
} from 'react-icons/hi';

const features = [
  {
    icon: FaChartLine,
    title: 'Track Your Impact',
    description: 'Monitor your daily carbon emissions across energy, transport, food, and shopping.',
    color: 'from-eco-400 to-eco-600',
  },
  {
    icon: FaLightbulb,
    title: 'Smart Recommendations',
    description: 'Get personalized AI-powered tips to reduce your environmental footprint.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: FaMobileAlt,
    title: 'Beautiful Dashboard',
    description: 'Visualize your progress with stunning charts and an intuitive Carbon Dial.',
    color: 'from-blue-400 to-indigo-600',
  },
];

const categories = [
  { icon: HiLightningBolt, name: 'Energy', color: 'bg-yellow-500' },
  { icon: HiTruck, name: 'Transport', color: 'bg-blue-500' },
  { icon: HiCake, name: 'Food', color: 'bg-green-500' },
  { icon: HiShoppingBag, name: 'Shopping', color: 'bg-purple-500' },
];

const stats = [
  { value: '2.5T', label: 'Annual Target CO₂e' },
  { value: '4', label: 'Activity Categories' },
  { value: '50+', label: 'Emission Factors' },
  { value: '100%', label: 'Free to Use' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-eco-400 to-eco-600 rounded-xl flex items-center justify-center shadow-lg shadow-eco-500/30">
                <FaLeaf className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-eco-600 to-eco-400 bg-clip-text text-transparent">
                EcoTrack
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Link
                to="/login"
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-eco-500 to-eco-600 text-white font-medium rounded-xl 
                           hover:from-eco-600 hover:to-eco-700 transition-all shadow-lg shadow-eco-500/30
                           hover:shadow-eco-500/40 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-eco-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-eco-50 text-eco-700 rounded-full text-sm font-medium mb-6">
                <HiStar className="text-eco-500" />
                Track, Reduce, Make a Difference
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight"
            >
              Your Personal{' '}
              <span className="bg-gradient-to-r from-eco-500 via-eco-400 to-teal-400 bg-clip-text text-transparent">
                Carbon Footprint
              </span>{' '}
              Tracker
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Make informed decisions about your environmental impact. Track your daily activities, 
              visualize your emissions, and discover ways to live more sustainably.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-eco-500 to-eco-600 
                           text-white font-semibold rounded-2xl shadow-xl shadow-eco-500/30
                           hover:from-eco-600 hover:to-eco-700 hover:shadow-eco-500/40 
                           hover:-translate-y-1 transition-all duration-300"
              >
                Start Tracking Free
                <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold 
                           rounded-2xl border-2 border-slate-200 hover:border-eco-300 hover:bg-eco-50
                           hover:-translate-y-1 transition-all duration-300"
              >
                Sign In to Dashboard
              </Link>
            </motion.div>

            {/* Category Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 flex items-center justify-center gap-4"
            >
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                  className="group relative"
                >
                  <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center 
                                  shadow-lg transform group-hover:scale-110 group-hover:-rotate-6 
                                  transition-all duration-300 cursor-pointer`}>
                    <cat.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 
                                   opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {cat.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-eco-600 to-eco-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-2 text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Everything You Need to Go{' '}
              <span className="text-eco-500">Green</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you understand and reduce your environmental impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 
                           border border-slate-100 hover:border-eco-200 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} 
                                flex items-center justify-center shadow-lg mb-6
                                group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-eco-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Three simple steps to start reducing your carbon footprint
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up for free and set your baseline profile' },
              { step: '2', title: 'Log Activities', desc: 'Track your energy, transport, food, and purchases' },
              { step: '3', title: 'See Results', desc: 'View insights, charts, and personalized recommendations' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-eco-500 to-eco-600 
                                rounded-2xl flex items-center justify-center text-white text-2xl 
                                font-bold shadow-xl shadow-eco-500/30 mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 
                                  bg-gradient-to-r from-eco-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-eco-500 via-eco-600 to-teal-600 
                       rounded-3xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-eco-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users who are actively reducing their carbon footprint. 
                Start your journey towards a sustainable future today.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-eco-600 
                           font-semibold rounded-2xl shadow-xl hover:shadow-2xl
                           hover:-translate-y-1 transition-all duration-300"
              >
                Get Started — It's Free
                <HiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-eco-500 rounded-lg flex items-center justify-center">
                <FaLeaf className="text-white text-sm" />
              </div>
              <span className="font-semibold text-white">EcoTrack</span>
            </div>
            <p className="text-sm">
              Built with 💚 for a sustainable future • © 2026 EcoTrack
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
