import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const DriverDashboard = () => {
  const [tracking, setTracking] = useState(true);
  const [tripStarted, setTripStarted] = useState(false);
  const [status, setStatus] = useState('GPS active');
  const [location, setLocation] = useState({ latitude: 11.34, longitude: 77.72, speed: 24 });
  const [liveMessage, setLiveMessage] = useState('Waiting for trip to start');

  useEffect(() => {
    if (!tracking || !tripStarted) {
      setStatus(tracking ? 'Trip ready, GPS on' : 'GPS off');
      return undefined;
    }

    if (!navigator.geolocation) {
      setStatus('GPS not supported');
      setLiveMessage('This browser does not support location access.');
      return undefined;
    }

    setStatus('Tracking live');
    setLiveMessage('Waiting for phone location permission...');

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const nextPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 24
        };

        setLocation(nextPoint);
        try {
          await axios.post(`${API_BASE_URL}/api/gps/update`, {
            busId: 'SVG-001',
            latitude: nextPoint.latitude,
            longitude: nextPoint.longitude,
            speed: nextPoint.speed,
            status: 'Moving'
          });
          setLiveMessage(`Live location sent: ${nextPoint.latitude.toFixed(4)}, ${nextPoint.longitude.toFixed(4)}`);
        } catch (error) {
          setStatus('GPS update failed');
          setLiveMessage('GPS update failed. Please check the backend connection.');
        }
      },
      (error) => {
        const isSecureOriginError = error.code === 1 || error.message?.includes('secure origins') || error.message?.includes('Only secure origins are allowed');
        setStatus(isSecureOriginError ? 'Secure origin required' : 'Location access denied');
        setLiveMessage(
          isSecureOriginError
            ? 'This browser blocked location because the app is not running on a secure origin. Open the app over HTTPS.'
            : (error.message || 'Please allow location access on the phone.')
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking, tripStarted]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Driver Dashboard</h2>
        <div className="mt-4 space-y-3">
          <button onClick={() => setTripStarted(!tripStarted)} className="w-full rounded-2xl bg-cyan-700 px-4 py-3 font-semibold text-white">
            {tripStarted ? 'Stop Trip' : 'Start Trip'}
          </button>
          <button onClick={() => setTracking(!tracking)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700">
            {tracking ? 'Turn GPS OFF' : 'Turn GPS ON'}
          </button>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Live Status</p>
          <p className="mt-2 text-slate-700">{status}</p>
          <p className="mt-2 text-sm text-slate-600">Latitude: {location.latitude.toFixed(4)} • Longitude: {location.longitude.toFixed(4)} • Speed: {location.speed} km/h</p>
          <p className="mt-2 text-sm font-medium text-cyan-700">{liveMessage}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Assigned Route</h3>
        <ul className="mt-4 space-y-3 text-slate-600">
          <li className="rounded-2xl bg-slate-50 p-3">Route: Route 1</li>
          <li className="rounded-2xl bg-slate-50 p-3">Stops: Main Gate → Library → Cafeteria → Hostel Block</li>
          <li className="rounded-2xl bg-slate-50 p-3">Status: {tripStarted ? 'Trip in progress' : 'Ready for trip'}</li>
        </ul>
      </div>
    </div>
  );
};

export default DriverDashboard;
