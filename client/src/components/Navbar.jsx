import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, LayoutDashboard, Search, BookOpen, Star } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Car size={24} />
          WageTexi
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              {user.role === 'driver' && (
                <>
                  <Link to="/vehicles" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                    <Search size={16} />
                    Find Vehicles
                  </Link>
                  <Link to="/bookings" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                    <BookOpen size={16} />
                    My Bookings
                  </Link>
                </>
              )}

              {user.role === 'owner' && (
                <>
                  <Link to="/my-vehicles" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                    <Car size={16} />
                    My Vehicles
                  </Link>
                  <Link to="/booking-requests" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                    <BookOpen size={16} />
                    Requests
                  </Link>
                </>
              )}

              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === 'driver' ? 'bg-green-100 text-green-700' :
                  user.role === 'owner' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 ml-1"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium">Login</Link>
              <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
