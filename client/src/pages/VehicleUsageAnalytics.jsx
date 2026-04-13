import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/analytics.css';

const VehicleUsageAnalytics = () => {
  const { vehicleId } = useParams();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchUsage();
  }, [dateRange]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await axios.get(`/api/analytics/vehicle/${vehicleId}/usage`, { params });
      setUsage(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch usage data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="analytics-loader">Loading usage data...</div>;

  return (
    <div className="analytics-container">
      <h1>Vehicle Usage Analytics</h1>

      {error && <div className="error-banner">{error}</div>}

      {usage && (
        <>
          <div className="vehicle-header">
            <h2>{usage.vehicle.name} ({usage.vehicle.licensePlate})</h2>
            <p>{usage.vehicle.year} • {usage.vehicle.make}</p>
          </div>

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
            <button onClick={fetchUsage} className="btn-refresh">Refresh</button>
          </div>

          <div className="summary-cards">
            <div className="card">
              <h3>Total Earnings</h3>
              <p className="amount">₹{usage.summary.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3>Total Trips</h3>
              <p className="amount">{usage.summary.totalTrips}</p>
            </div>
            <div className="card">
              <h3>Days Rented</h3>
              <p className="amount">{usage.summary.totalDaysRented}</p>
            </div>
            <div className="card">
              <h3>Utilization Rate</h3>
              <p className="amount">{usage.summary.utilizationRate}%</p>
            </div>
            <div className="card">
              <h3>Avg/Day</h3>
              <p className="amount">₹{usage.summary.averageEarningsPerDay}</p>
            </div>
          </div>

          {usage.tripHistory.length > 0 && (
            <div className="trip-history">
              <h2>Trip History</h2>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Driver Rating</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Earnings</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.tripHistory.map(trip => (
                    <tr key={trip.id}>
                      <td>{trip.driver}</td>
                      <td>
                        <span className="rating">
                          ⭐ {trip.driverRating.toFixed(1)}
                        </span>
                      </td>
                      <td>{new Date(trip.startDate).toLocaleDateString()}</td>
                      <td>{new Date(trip.endDate).toLocaleDateString()}</td>
                      <td>{trip.totalDays}</td>
                      <td>₹{trip.earnings}</td>
                      <td>
                        {trip.driverReview !== 'N/A' ? (
                          <span className="review-badge">⭐ {trip.driverReview}</span>
                        ) : (
                          <span className="no-review">No Review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {usage.tripHistory.length === 0 && (
            <div className="no-data">
              <p>No trip history found for this vehicle.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VehicleUsageAnalytics;
