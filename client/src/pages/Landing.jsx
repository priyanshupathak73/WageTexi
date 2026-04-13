import React from 'react';
import { ShieldCheck, MapPin, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <header className="relative bg-slate-900 py-20 px-6 text-center text-white overflow-hidden">
        <motion.div 
          className="max-w-4xl mx-auto relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 variants={fadeUp} className="text-5xl font-extrabold tracking-tight mb-6">
            Organizing the <span className="text-yellow-400">Daily-Wage</span> Taxi Ecosystem
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            A secure marketplace connecting vehicle owners with verified drivers for flexible, 
            daily-basis rentals. Transparency, trust, and efficiency in every mile.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-400 text-slate-900 w-full px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all flex items-center justify-center shadow-lg shadow-yellow-500/20"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </Link>
            <Link to="/vehicles">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 w-full border border-white/20 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
              >
                Browse Vehicles
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </header>

      {/* Stats Section */}
      <section className="py-12 bg-yellow-400">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-slate-900"
        >
          {[
            { title: "Real-Time", desc: "GPS Trip Tracking" },
            { title: "Verified", desc: "Driver Credentials" },
            { title: "Scalable", desc: "MVC Architecture" },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -5 }}>
              <div className="text-4xl font-black">{stat.title}</div>
              <p className="font-medium opacity-80">{stat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Key Features (Problem Solvers) */}
      <section className="py-24 px-6 max-w-6xl mx-auto relative">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-16 underline decoration-yellow-400 decoration-4 underline-offset-8"
        >
          Why Use Our Platform?
        </motion.h2>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <FeatureCard 
            icon={<ShieldCheck className="text-yellow-500 w-10 h-10" />}
            title="Digital Contracts"
            desc="Clear agreements generated instantly for every booking to ensure legal safety."
          />
          <FeatureCard 
            icon={<MapPin className="text-yellow-500 w-10 h-10" />}
            title="Location Matching"
            desc="Connect with owners or drivers closest to you to reduce downtime."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-yellow-500 w-10 h-10" />}
            title="Earnings Dashboard"
            desc="Detailed reports for owners to track vehicle utilization and daily income."
          />
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16"
          >
            How It Works
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <Step number="1" title="Owners List Vehicles" desc="Upload RC, vehicle photos, and set your daily rental price." />
            <Step number="2" title="Drivers Request" desc="Verified drivers browse nearby cars and send rental requests." />
            <Step number="3" title="Smart Matching" desc="Our AI-based system scores drivers to help owners pick the best match." />
            <Step number="4" title="Live Tracking" desc="Both parties stay updated with real-time Socket.io notifications." />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-slate-500 bg-white">
        <p>© {new Date().getFullYear()} Daily-Wage Taxi Aggregator. Built with React + Node.js</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    variants={fadeUp}
    whileHover={{ y: -10, boxShadow: "0px 10px 20px rgba(0,0,0,0.05)" }}
    className="p-8 border border-slate-100 rounded-2xl shadow-sm bg-white transition-all"
  >
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className="mb-4"
    >
      {icon}
    </motion.div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </motion.div>
);

const Step = ({ number, title, desc }) => (
  <motion.div 
    variants={fadeUp} 
    className="flex gap-6 items-start"
  >
    <motion.div 
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
      className="bg-yellow-400 text-slate-900 w-12 h-12 rounded-full flex items-center justify-center font-black shrink-0 shadow-md"
    >
      {number}
    </motion.div>
    <div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  </motion.div>
);

export default LandingPage;