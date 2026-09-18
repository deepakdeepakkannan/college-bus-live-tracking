import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({ totalBuses: 0, totalStudents: 0, activeBuses: 0, completedTrips: 0 });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/dashboard-summary`).then((res) => setSummary(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Buses', summary.totalBuses],
          ['Total Students', summary.totalStudents],
          ['Active Buses', summary.activeBuses],
          ['Completed Trips', summary.completedTrips]
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Bus Management</h3>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li className="rounded-2xl bg-slate-50 p-3">Add, edit, and monitor bus information</li>
            <li className="rounded-2xl bg-slate-50 p-3">Assign routes and driver data</li>
            <li className="rounded-2xl bg-slate-50 p-3">Track seat occupancy</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Student Management</h3>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li className="rounded-2xl bg-slate-50 p-3">Register student and assign bus</li>
            <li className="rounded-2xl bg-slate-50 p-3">View drop-off stop and department</li>
            <li className="rounded-2xl bg-slate-50 p-3">Monitor route participation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
