import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/analytics.css';

const OwnerEarningsAnalytics = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchEarnings();
  }, [dateRange]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await axios.get('/api/analytics/owner/earnings', { params });
      setEarnings(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch earnings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="analytics-loader">Loading earnings data...</div>;

  return (
    <div className="analytics-container">
      <h1>Owner Earnings Dashboard</h1>

      {error && <div className="error-banner">{error}</div>}

      <div className="filter-section">
        <label>
          Start Date:
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
          />
        </label>
        <button onClick={fetchEarnings} className="btn-refresh">Refresh</button>
      </div>

      {earnings && (
        <>
          <div className="summary-cards">
            <div className="card">
              <h3>Total Earnings</h3>
              <p className="amount">₹{earnings.summary.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3>Total Trips</h3>
              <p className="amount">{earnings.summary.totalTrips}</p>
            </div>
            <div className="card">
              <h3>Active Vehicles</h3>
              <p className="amount">{earnings.summary.totalVehicles}</p>
            </div>
            <div className="card">
              <h3>Avg Per Trip</h3>
              <p className="amount">₹{earnings.summary.averagePerTrip}</p>
            </div>
          </div>

          {earnings.earningsByVehicle.length > 0 && (
            <div className="vehicle-earnings">
              <h2>Earnings by Vehicle</h2>
              <table className="vehicle-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Total Trips</th>
                    <th>Total Earnings</th>
                    <th>Avg Per Trip</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.earningsByVehicle.map((vehicle, idx) => (
                    <tr key={idx}>
                      <td>{vehicle.name}</td>
                      <td>{vehicle.trips}</td>
                      <td>₹{vehicle.earnings}</td>
                      <td>₹{Math.round(vehicle.earnings / vehicle.trips)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {earnings.recentBookings.length > 0 && (
            <div className="recent-bookings">
              <h2>Recent Bookings</h2>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Duration (Days)</th>
                    <th>Earnings</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.recentBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.driver}</td>
                      <td>{booking.vehicleName}</td>
                      <td>{booking.duration}</td>
                      <td>₹{booking.amount}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerEarningsAnalytics;
