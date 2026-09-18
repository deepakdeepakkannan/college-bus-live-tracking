import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const StudentDashboard = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/students`).then((res) => setStudents(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Student Dashboard</h2>
        <p className="mt-2 text-slate-600">Your assigned bus details and pickup stop are shown below.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {students.map((student) => (
          <div key={student.registerNumber} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{student.name}</h3>
            <p className="mt-2 text-slate-600">Register Number: {student.registerNumber}</p>
            <p className="mt-2 text-slate-600">Department: {student.department}</p>
            <p className="mt-2 text-slate-600">Bus: {student.busNumber}</p>
            <p className="mt-2 text-slate-600">Boarding Stop: {student.stop}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
