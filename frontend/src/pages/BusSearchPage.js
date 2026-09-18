import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { API_BASE_URL } from '../apiConfig';

const fallbackCenter = [11.3432, 77.7224];
const liveSocketEnabled = process.env.REACT_APP_ENABLE_LIVE_SOCKET === 'true' || process.env.NODE_ENV === 'development';

const BusSearchPage = () => {
  const [query, setQuery] = useState('');
  const [bus, setBus] = useState(null);
  const [allBuses, setAllBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const shouldShowBusList = allBuses.length > 0;
  const socketRef = useRef(null);
  const visibleBuses = allBuses.slice(0, visibleCount);

  useEffect(() => {
    if (!liveSocketEnabled) return undefined;

    const socket = io(API_BASE_URL);
    socketRef.current = socket;

    socket.on('gpsUpdate', (payload) => {
      const busId = payload.busId;

      setBus((prevBus) => {
        if (!prevBus) return prevBus;
        if (prevBus.busNumber !== busId && prevBus._id !== busId) return prevBus;
        return {
          ...prevBus,
          currentLocation: { latitude: payload.latitude, longitude: payload.longitude },
          speed: payload.speed,
          status: payload.status || prevBus.status
        };
      });

      setAllBuses((prevBuses) => prevBuses.map((item) => {
        if (item.busNumber !== busId && item._id !== busId) return item;
        return {
          ...item,
          currentLocation: { latitude: payload.latitude, longitude: payload.longitude },
          speed: payload.speed,
          status: payload.status || item.status
        };
      }));
    });

    axios.get(`${API_BASE_URL}/api/buses`).then((res) => {
      const buses = Array.isArray(res.data) ? res.data : [];
      setAllBuses(buses);
      setVisibleCount(12);
      if (buses?.[0]) {
        setBus(buses[0]);
        setQuery(buses[0].busNumber);
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!liveSocketEnabled || !bus?.busNumber) return;
    socketRef.current?.emit('joinBus', bus.busNumber);
  }, [bus?.busNumber]);

  const executeSearch = async (searchTerm) => {
    if (!searchTerm) {
      setBus(null);
      setError('Please enter a bus number, route, driver name, or phone to search.');
      setNoResults(false);
      setTimeoutError(false);
      return;
    }

    setLoading(true);
    setError('');
    setNoResults(false);
    setTimeoutError(false);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/bus?q=${encodeURIComponent(searchTerm)}`, {
        timeout: 10000
      });
      const matches = Array.isArray(res.data) ? res.data : [res.data];
      setBus(matches[0] || null);
      setAllBuses(matches);
      setVisibleCount(12);
      setNoResults(false);
    } catch (err) {
      setBus(null);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setNoResults(true);
          setError('');
        } else if (err.code === 'ECONNABORTED') {
          setTimeoutError(true);
          setError('Request timed out. Please try again in a moment.');
        } else {
          setError(err.response?.data?.message || 'Unable to search buses right now. Please try again later.');
        }
      } else {
        setError('Unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    executeSearch(query.trim());
  };

  const handleBusSelect = async (item) => {
    setQuery(item.busNumber);
    executeSearch(item.busNumber);
  };

  const handleRetry = () => {
    executeSearch(query.trim());
  };

  const googleMapUrl = `https://www.google.com/maps?q=${bus?.currentLocation?.latitude || fallbackCenter[0]},${bus?.currentLocation?.longitude || fallbackCenter[1]}&z=13&output=embed`;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Live Bus Search & Tracking</h2>
            <p className="mt-1 text-sm text-slate-600">Search any bus and view its live location, route, and current status in one place.</p>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            Live tracking active
          </div>
        </div>
        <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 md:flex-row">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter Bus Number, Route, Driver Name or Phone" className="flex-1 rounded-2xl border border-slate-300 px-4 py-3" />
          <button type="submit" className="rounded-2xl bg-cyan-700 px-5 py-3 font-semibold text-white">Search</button>
        </form>

        {loading && <p className="mt-3 text-sm text-slate-600">Searching buses...</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {!loading && timeoutError && (
          <button type="button" onClick={handleRetry} className="mt-3 inline-flex items-center rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
            Retry
          </button>
        )}
        {!loading && noResults && <p className="mt-3 text-sm text-slate-700">No buses found for &quot;{query.trim()}&quot;.</p>}
      </div>

      {bus && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Bus Details</h3>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">{bus.status || 'Active'}</span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info label="Bus Number" value={bus.busNumber} />
              <Info label="Driver Name" value={bus.driverName} />
              <Info label="Driver Phone" value={bus.driverPhone} />
              <Info label="Registration Number" value={bus.registrationNumber} />
              <Info label="Capacity" value={bus.capacity} />
              <Info label="Students Inside" value={bus.currentStudents} />
              <Info label="Route" value={bus.route} />
              <Info label="Starting Point" value={bus.startingPoint} />
              <Info label="Destination" value={bus.destination} />
              <Info label="Start Time" value={bus.timing} />
              <Info label="Next Stop" value={bus.stops?.[1]?.name || 'Library'} />
              <Info label="Current Speed" value={`${bus.speed || 24} km/h`} />
              <Info label="Latitude" value={bus.currentLocation?.latitude} />
              <Info label="Longitude" value={bus.currentLocation?.longitude} />
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-800">Live Details</p>
              <p className="mt-2 text-sm text-cyan-700">Status: {bus.status || 'Active'}</p>
              <p className="mt-1 text-sm text-cyan-700">Current location: {bus.currentLocation?.latitude}, {bus.currentLocation?.longitude}</p>
              <p className="mt-1 text-sm text-cyan-700">Live tracking is running for this bus.</p>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Route Stops</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {bus.stops?.map((stop) => (
                  <li key={stop.name} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <span>{stop.name}</span>
                    <span>{stop.distance} km</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Live Bus Tracking Map</h3>
            <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">
              Live status: {bus.status || 'Moving'} • Tracking is active for this bus.
            </div>
            <p className="mt-3 text-sm text-slate-600">Latitude: {bus.currentLocation?.latitude} • Longitude: {bus.currentLocation?.longitude}</p>
            <div className="mt-4 h-72 overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title="Live bus location"
                src={googleMapUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {shouldShowBusList && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Available Buses</h3>
          <p className="mt-2 text-sm text-slate-600">Showing {Math.min(visibleCount, allBuses.length)} of {allBuses.length} matching buses.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {visibleBuses.map((item) => (
              <div key={item.busNumber} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold">{item.busNumber}</p>
                <p className="text-sm text-slate-600">Route: {item.route} • Driver: {item.driverName}</p>
                <p className="mt-1 text-sm font-medium text-cyan-700">Phone: {item.driverPhone}</p>
                <button onClick={() => handleBusSelect(item)} className="mt-3 rounded-xl bg-cyan-700 px-3 py-2 text-sm font-semibold text-white">
                  View Live Location
                </button>
              </div>
            ))}
          </div>
          {visibleCount < allBuses.length && (
            <button type="button" onClick={() => setVisibleCount((prev) => prev + 12)} className="mt-4 rounded-2xl border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
              Show more buses
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-2 text-slate-700">{value}</p>
  </div>
);

export default BusSearchPage;
