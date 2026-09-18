import { useMemo, useState } from 'react';

const LandingPage = () => {
  const [summary] = useState({ totalBuses: 12, totalStudents: 320, activeBuses: 6, completedTrips: 84 });
  const [college] = useState({
    collegeName: 'Shree Venkateshwara Group of Institutions',
    phone: '+91 98765 43210',
    email: 'transport@svg.edu',
    address: 'Otthakkuthirai, Gobichettipalayam, Erode District, Tamil Nadu',
    website: 'https://svg.edu'
  });

  const statCards = useMemo(() => [
    { label: 'Total Buses', value: summary.totalBuses, color: 'from-cyan-500 to-blue-500' },
    { label: 'Total Students', value: summary.totalStudents, color: 'from-violet-500 to-purple-600' },
    { label: 'Active Buses', value: summary.activeBuses, color: 'from-emerald-500 to-green-600' },
    { label: 'Completed Trips', value: summary.completedTrips, color: 'from-amber-500 to-orange-500' }
  ], [summary]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-amber-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.30)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">College Bus Live Tracker</p>
            <h1 className="mt-3 text-4xl font-extrabold">{college.collegeName || 'Shree Venkateshwara Group of Institutions'}</h1>
            <p className="mt-4 max-w-2xl text-sm text-cyan-50">
              Track every college bus in real time, monitor student boarding activity, and keep the campus commute safe and efficient.
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-6 backdrop-blur">
            <p className="text-sm">College Contact</p>
            <p className="mt-2 font-semibold">{college.phone || '+91 98765 43210'}</p>
            <p className="text-sm text-cyan-100">{college.email || 'transport@svg.edu'}</p>
          </div>
        </div>
      </section>

      

      <section className="grid gap-6">
        <div className="rounded-[1.75rem] border border-amber-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="text-2xl font-semibold">About the College</h2>
          <p className="mt-3 text-slate-600">
            {college.collegeName || 'Shree Venkateshwara Group of Institutions'} offers seamless transport services across campus with live bus tracking, stop updates, and route management for students and parents.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Address</p>
              <p className="mt-2 text-slate-700">{college.address || 'Otthakkuthirai, Gobichettipalayam, Erode District, Tamil Nadu'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Website</p>
              <p className="mt-2 text-slate-700">{college.website || 'https://svg.edu'}</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Our Institutes</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  key: 'svhec',
                  name: 'Shree Venkateshwara Hi-Tech Engineering College (SVHEC)',
                  desc:
                    "Established in 2008. Autonomous, AICTE-approved, affiliated with Anna University, Chennai. NAAC 'A' grade and NBA accreditations for Civil, CSE, ECE, EEE, Mechanical.",
                  url: college.website || 'https://svg.edu'
                },
                {
                  key: 'svhpc',
                  name: 'Shree Venkateshwara Hi-Tech Polytechnic College (SVHPC)',
                  desc: 'Established in 2009 to provide practical diploma-level technical education.',
                  url: college.website || 'https://svg.edu'
                },
                {
                  key: 'svcas',
                  name: 'Shree Venkateshwara Arts & Science College (SVCAS)',
                  desc: 'Co-educational college founded in 2019, affiliated with Bharathiar University, Coimbatore.',
                  url: college.website || 'https://svg.edu'
                },
                {
                  key: 'medical',
                  name: 'Medical & Paramedical Wings',
                  desc: 'Includes colleges for Pharmacy, Physiotherapy, Nursing, Occupational Therapy, and Allied Health Sciences (from 2018).',
                  url: college.website || 'https://svg.edu'
                }
              ].map((inst, idx) => (
                <a
                  key={inst.key}
                  href={inst.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`block rounded-2xl p-4 text-white shadow-lg transform hover:-translate-y-1 transition-all duration-150 ${
                    idx === 0
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                      : idx === 1
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                      : idx === 2
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                      : 'bg-gradient-to-br from-amber-400 to-orange-500'
                  }`}
                >
                  <p className="text-sm font-bold">{inst.name}</p>
                  <p className="mt-2 text-xs opacity-95">{inst.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        
      </section>
    </div>
  );
};

export default LandingPage;
