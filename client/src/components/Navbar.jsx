import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, LayoutDashboard, Search, BookOpen, Zap, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const NavLink = ({ to, icon: Icon, label }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to || pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${
        isActive
          ? 'bg-yellow-400/20 text-yellow-400'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={15} />
      {label}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 sticky top-0 z-50 shadow-lg shadow-slate-900/50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 text-yellow-400 font-extrabold text-xl tracking-tight"
          >
            <div className="bg-yellow-400 p-1.5 rounded-lg">
              <Car size={18} className="text-slate-900" />
            </div>
            WageTexi
          </motion.div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

              {user.role === 'driver' && (
                <>
                  <NavLink to="/vehicles" icon={Search} label="Find Vehicles" />
                  <NavLink to="/bookings" icon={BookOpen} label="My Bookings" />
                  <NavLink to="/smart-match" icon={Zap} label="AI Match" />
                </>
              )}

              {user.role === 'owner' && (
                <>
                  <NavLink to="/my-vehicles" icon={Car} label="My Vehicles" />
                  <NavLink to="/booking-requests" icon={BookOpen} label="Requests" />
                </>
              )}

              {/* Right side: notification + user */}
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-700">
                {/* Notification placeholder */}
                <button
                  className="relative p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="Notifications"
                >
                  <Bell size={18} />
                </button>

                {/* User pill */}
                <div className="flex items-center gap-2 bg-white/5 border border-slate-700 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900 text-xs font-black shrink-0">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-white hidden sm:block">{user.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider hidden sm:block ${
                    user.role === 'driver'
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : user.role === 'owner'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  title="Logout"
                >
                  <LogOut size={17} />
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-slate-300 hover:text-yellow-400 font-semibold transition-colors px-3 py-1.5">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl hover:bg-yellow-300 font-bold shadow-md shadow-yellow-500/20 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
