import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/analytics.css';

const DriverPerformanceAnalytics = () => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/driver/performance');
      setPerformance(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch performance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  if (loading) return <div className="analytics-loader">Loading performance data...</div>;

  return (
    <div className="analytics-container">
      <h1>Performance Dashboard</h1>

      {error && <div className="error-banner">{error}</div>}

      {performance && (
        <>
          <div className="profile-section">
            <h2>{performance.profile.name}</h2>
            <div className="score-cards">
              <div className={`score-card ${getScoreBadge(performance.profile.performanceScore)}`}>
                <h3>Performance Score</h3>
                <p className="score">{performance.profile.performanceScore}/100</p>
              </div>
              <div className="score-card">
                <h3>Average Rating</h3>
                <p className="score">⭐ {performance.profile.averageRating.toFixed(1)}/5</p>
                <p className="subtext">({performance.profile.totalRatings} ratings)</p>
              </div>
            </div>
          </div>

          <div className="statistics-section">
            <h2>Trip Statistics</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <h4>Completed Trips</h4>
                <p className="stat-value">{performance.statistics.completedTrips}</p>
              </div>
              <div className="stat-box">
                <h4>Cancelled Trips</h4>
                <p className="stat-value">{performance.statistics.cancelledTrips}</p>
              </div>
              <div className="stat-box">
                <h4>Completion Rate</h4>
                <p className="stat-value">{performance.statistics.completionRate}%</p>
              </div>
              <div className="stat-box">
                <h4>Total Bookings</h4>
                <p className="stat-value">{performance.statistics.totalBookings}</p>
              </div>
              <div className="stat-box">
                <h4>Total Earnings</h4>
                <p className="stat-value">₹{performance.statistics.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {performance.recentReviews.length > 0 && (
            <div className="reviews-section">
              <h2>Recent Reviews</h2>
              <div className="reviews-list">
                {performance.recentReviews.map((review, idx) => (
                  <div key={idx} className="review-card">
                    <div className="review-header">
                      <span className="rating">⭐ {review.rating}/5</span>
                      <span className="date">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{review.comment || 'No comment provided'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="performance-tips">
            <h2>Tips to Improve Performance</h2>
            <ul>
              <li>✓ Maintain a high completion rate by honoring all bookings</li>
              <li>✓ Drive safely to receive positive ratings from owners</li>
              <li>✓ Communicate promptly with vehicle owners</li>
              <li>✓ Return vehicles on time and in good condition</li>
              <li>✓ Build a strong track record for better booking opportunities</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverPerformanceAnalytics;
