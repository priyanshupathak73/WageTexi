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
import Landing from './pages/Landing';
import SmartMatch from './pages/SmartMatch';
import ContractPage from './pages/ContractPage';
import TripTracker from './pages/TripTracker';
import DriverEarningsAnalytics from './pages/DriverEarningsAnalytics';
import OwnerEarningsAnalytics from './pages/OwnerEarningsAnalytics';
import VehicleUsageAnalytics from './pages/VehicleUsageAnalytics';
import DriverPerformanceAnalytics from './pages/DriverPerformanceAnalytics';
import AdminAnalytics from './pages/AdminAnalytics';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />

              {/* Protected – Any authenticated user */}
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              {/* Role-specific dashboard routes — redirect to the shared Dashboard */}
              <Route path="/driver/dashboard" element={
                <PrivateRoute roles={['driver']}><Dashboard /></PrivateRoute>
              } />
              <Route path="/owner/dashboard" element={
                <PrivateRoute roles={['owner']}><Dashboard /></PrivateRoute>
              } />
              <Route path="/bookings/:id" element={
                <PrivateRoute><BookingDetail /></PrivateRoute>
              } />

              {/* Driver only */}
              <Route path="/bookings" element={
                <PrivateRoute roles={['driver']}><MyBookings /></PrivateRoute>
              } />
              <Route path="/smart-match" element={
                <PrivateRoute roles={['driver']}><SmartMatch /></PrivateRoute>
              } />
              <Route path="/analytics/earnings" element={
                <PrivateRoute roles={['driver']}><DriverEarningsAnalytics /></PrivateRoute>
              } />
              <Route path="/analytics/performance" element={
                <PrivateRoute roles={['driver']}><DriverPerformanceAnalytics /></PrivateRoute>
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
              <Route path="/analytics/owner-earnings" element={
                <PrivateRoute roles={['owner']}><OwnerEarningsAnalytics /></PrivateRoute>
              } />
              <Route path="/analytics/vehicle/:vehicleId" element={
                <PrivateRoute roles={['owner']}><VehicleUsageAnalytics /></PrivateRoute>
              } />
              <Route path="/contract/:bookingId" element={
                <PrivateRoute><ContractPage /></PrivateRoute>
              } />
              <Route path="/trip/:bookingId" element={
                <PrivateRoute><TripTracker /></PrivateRoute>
              } />
              <Route path="/analytics/platform" element={
                <PrivateRoute roles={['admin']}><AdminAnalytics /></PrivateRoute>
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
