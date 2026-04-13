import React from 'react';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import Booking from '../pages/Booking';
import Profile from '../pages/Profile';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  // Simple routing based on authentication and user type
  if (!isAuthenticated) {
    return <Home />;
  }

  // Route based on user type (owner or driver)
  if (user?.type === 'owner') {
    return <Dashboard />;
  }

  return <Vehicles />;
};

export default AppRoutes;
