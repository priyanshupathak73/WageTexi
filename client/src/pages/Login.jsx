import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import toast from 'react-hot-toast';
import { LogIn, Car, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'driver' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user) {
    navigate(user.role === 'driver' ? '/driver/dashboard' : '/owner/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setRole = (role) => setForm({ ...form, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'driver') {
        navigate('/driver/dashboard');
      } else if (data.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900 rounded-b-[100%] scale-150 z-0 opacity-10 blur-3xl" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md p-8 relative z-10"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
          <div className="bg-yellow-400 p-2.5 rounded-xl shadow-sm text-slate-900">
            <LogIn size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h1>
        </motion.div>

        {/* Role selector */}
        <motion.div variants={itemVariants} className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'driver', label: 'Driver', icon: <Car size={18} /> },
              { value: 'owner', label: 'Vehicle Owner', icon: <Briefcase size={18} /> },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.role === value
                    ? 'border-yellow-400 bg-yellow-400/10 text-slate-900'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="you@example.com"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="••••••••"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            {error && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-yellow-400 py-3.5 rounded-xl font-bold text-base shadow-lg hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Signing in...' : `Sign In as ${form.role === 'driver' ? 'Driver' : 'Owner'}`}
            </motion.button>
          </motion.div>
        </form>

        <motion.p variants={itemVariants} className="text-center text-sm text-slate-500 mt-8 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-slate-900 hover:text-yellow-600 underline font-bold transition-colors">
            Create one now
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
