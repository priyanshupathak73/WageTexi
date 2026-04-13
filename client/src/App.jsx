import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import VehicleForm from './pages/VehicleForm';
import MyVehicles from './pages/MyVehicles';
import MyBookings from './pages/MyBookings';
import BookingRequests from './pages/BookingRequests';
import BookingDetail from './pages/BookingDetail';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />

              {/* Protected – Any authenticated user */}
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              <Route path="/bookings/:id" element={
                <PrivateRoute><BookingDetail /></PrivateRoute>
              } />

              {/* Driver only */}
              <Route path="/bookings" element={
                <PrivateRoute roles={['driver']}><MyBookings /></PrivateRoute>
              } />

              {/* Owner only */}
              <Route path="/my-vehicles" element={
                <PrivateRoute roles={['owner']}><MyVehicles /></PrivateRoute>
              } />
              <Route path="/my-vehicles/add" element={
                <PrivateRoute roles={['owner']}><VehicleForm /></PrivateRoute>
              } />
              <Route path="/my-vehicles/edit/:id" element={
                <PrivateRoute roles={['owner']}><VehicleForm /></PrivateRoute>
              } />
              <Route path="/booking-requests" element={
                <PrivateRoute roles={['owner']}><BookingRequests /></PrivateRoute>
              } />

              {/* 404 */}
              <Route path="*" element={
                <div className="text-center py-24 text-gray-500">
                  <p className="text-5xl mb-4">404</p>
                  <p className="font-medium">Page not found</p>
                </div>
              } />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
