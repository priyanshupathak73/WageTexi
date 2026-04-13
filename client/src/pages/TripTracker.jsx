import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { locationService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { MapPin, Play, Square, Navigation } from 'lucide-react';

const TripTracker = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const isDriver = user?.role === 'driver';

  const [tracking, setTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const watchRef = useRef(null);

  // Load existing trip data on mount
  useEffect(() => {
    locationService.getTripLocation(bookingId)
      .then(({ data }) => {
        if (data.tracking) {
          setCurrentLocation(data.currentLocation);
          setRouteHistory(data.routeHistory || []);
          setTracking(data.tracking);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Owner: listen for real-time location events
  useEffect(() => {
    if (!socket || isDriver) return;
    socket.emit('join:trip', bookingId);
    socket.on('trip:location', (data) => {
      if (data.bookingId === bookingId) {
        setCurrentLocation(data.location);
        setRouteHistory((prev) => [...prev, { ...data.location, timestamp: data.timestamp }]);
      }
    });
    return () => socket.off('trip:location');
  }, [socket, bookingId, isDriver]);

  // Driver: start broadcasting GPS
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setTracking(true);
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCurrentLocation({ lat, lng });
        try {
          await locationService.updateLocation({ bookingId, lat, lng });
        } catch {
          // Silent — next update will retry
        }
      },
      (err) => toast.error('GPS error: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [bookingId]);

  const stopTracking = useCallback(async () => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setTracking(false);
    try {
      await locationService.stopTracking(bookingId);
      toast.success('Tracking stopped');
    } catch {
      toast.error('Failed to stop tracking');
    }
  }, [bookingId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2.5 rounded-xl">
          <Navigation className="text-blue-600" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Trip Tracking</h1>
          <p className="text-sm text-gray-500">
            {isDriver ? 'Share your real-time location with the owner' : 'Track driver location in real-time'}
          </p>
        </div>
      </div>

      {/* Current location card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <MapPin size={16} className="text-red-500" />
            Current Location
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            tracking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {tracking ? '🟢 Live' : '⚫ Stopped'}
          </span>
        </div>

        {loading ? (
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        ) : currentLocation ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-mono text-sm text-gray-700">
              Lat: <strong>{currentLocation.lat?.toFixed(6)}</strong> &nbsp;|&nbsp;
              Lng: <strong>{currentLocation.lng?.toFixed(6)}</strong>
            </p>
            {currentLocation.address && (
              <p className="text-sm text-gray-500 mt-1">{currentLocation.address}</p>
            )}
            {/* Google Maps embed link */}
            <a
              href={`https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-blue-600 hover:underline"
            >
              📍 Open in Google Maps
            </a>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            {isDriver ? 'Start tracking to broadcast your location.' : 'No location received yet.'}
          </p>
        )}
      </div>

      {/* Route history summary */}
      {routeHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">Route History</h2>
          <p className="text-sm text-gray-500 mb-3">{routeHistory.length} location points recorded</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {[...routeHistory].reverse().slice(0, 20).map((pt, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-gray-500 py-1 border-b border-gray-50">
                <span className="font-mono">{pt.lat?.toFixed(5)}, {pt.lng?.toFixed(5)}</span>
                <span>{new Date(pt.timestamp).toLocaleTimeString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Driver controls */}
      {isDriver && (
        <div className="flex gap-3">
          {!tracking ? (
            <button
              onClick={startTracking}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Play size={18} /> Start Broadcasting Location
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              <Square size={18} /> Stop Tracking
            </button>
          )}
        </div>
      )}

      {!isDriver && !tracking && !currentLocation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          ⏳ Waiting for driver to start sharing location...
        </div>
      )}
    </div>
  );
};

export default TripTracker;
