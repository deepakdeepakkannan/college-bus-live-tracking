import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const liveSocketEnabled = process.env.REACT_APP_ENABLE_LIVE_SOCKET === 'true' || process.env.NODE_ENV === 'development';

const TrackingPage = () => {
  const [bus, setBus] = useState(null);
  const [gps, setGps] = useState({ latitude: 12.9716, longitude: 77.5946, speed: 28 });
  const [status, setStatus] = useState('Tracking live');

  useEffect(() => {
    let isMounted = true;

    const loadBus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/bus?q=${encodeURIComponent('SVG-001')}`);
        if (!isMounted) return;

        const busData = Array.isArray(res.data) ? res.data[0] : res.data;
        setBus(busData);
        if (busData?.currentLocation) {
          setGps({ latitude: busData.currentLocation.latitude, longitude: busData.currentLocation.longitude, speed: busData.speed || 24 });
        }
      } catch (error) {
        console.error('Failed to load bus data', error);
      }
    };

    loadBus();

    const socket = liveSocketEnabled ? io(API_BASE_URL, { transports: ['websocket', 'polling'] }) : null;
    socket?.emit('joinBus', 'SVG-001');
    socket?.on('gpsUpdate', (payload) => {
        if (!isMounted) return;
        if (payload?.busId && payload.busId !== 'SVG-001') return;
        setGps({ latitude: payload.latitude, longitude: payload.longitude, speed: payload.speed || 24 });
        setStatus(payload.status || 'Bus is moving');
      });

    return () => {
      isMounted = false;
      socket?.disconnect();
    };
  }, []);

  const googleMapUrl = `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}&z=13&output=embed`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-2xl font-semibold">Live Bus Tracking</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <iframe
            title="Live bus location"
            src={googleMapUrl}
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Current Status</h3>
          <p className="mt-2 text-slate-600">{status}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoCard label="Latitude" value={gps.latitude.toFixed(4)} />
            <InfoCard label="Longitude" value={gps.longitude.toFixed(4)} />
            <InfoCard label="Speed" value={`${gps.speed} km/h`} />
            <InfoCard label="Next Stop" value={bus?.stops?.[1]?.name || 'Library'} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Estimated Arrival</h3>
          <p className="mt-2 text-slate-600">Remaining distance: 4.8 km</p>
          <p className="mt-1 text-slate-600">ETA: 12 mins</p>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-2 text-slate-700">{value}</p>
  </div>
);

export default TrackingPage;
