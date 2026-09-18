import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const BusSearchPage = lazy(() => import('./pages/BusSearchPage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DriverDashboard = lazy(() => import('./pages/DriverDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));

function App() {
  return (
    <div className="min-h-screen bg-transparent text-slate-800">
      <nav className="border-b border-amber-200/70 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 px-6 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.25)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Link to="/" className="text-xl font-semibold tracking-wide text-amber-100">College Bus Live Tracker</Link>
          <div className="flex flex-wrap gap-3 text-sm text-amber-50/90">
            <NavLink to="/" className="rounded-full px-3 py-1 transition hover:bg-amber-500/20 hover:text-amber-200">Home</NavLink>
            <NavLink to="/search" className="rounded-full px-3 py-1 transition hover:bg-amber-500/20 hover:text-amber-200">Search Bus</NavLink>
            <NavLink to="/tracking" className="rounded-full px-3 py-1 transition hover:bg-amber-500/20 hover:text-amber-200">Live Tracking</NavLink>
            <NavLink to="/login" className="rounded-full px-3 py-1 transition hover:bg-amber-500/20 hover:text-amber-200">Login</NavLink>
            <NavLink to="/admin" className="rounded-full px-3 py-1 transition hover:bg-amber-500/20 hover:text-amber-200">Admin</NavLink>
            <NavLink to="/driver" className="rounded-full px-3 py-1 transition hover:bg-amber-500/20 hover:text-amber-200">Driver</NavLink>
            <NavLink to="/student" className="rounded-full px-3 py-1 transition hover:bg-amber-500/20 hover:text-amber-200">Student</NavLink>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="rounded-3xl border border-amber-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search" element={<BusSearchPage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
