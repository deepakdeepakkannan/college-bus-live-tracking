import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithFirebase } from '../firebase';
import { API_BASE_URL } from '../apiConfig';

const demoCredentials = {
  admin: { email: 'admin@greenvalley.edu', password: 'admin123' },
  driver: { email: 'driver@greenvalley.edu', password: 'driver123' },
  student: { email: 'student@greenvalley.edu', password: 'student123' }
};

const LoginPage = () => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState(demoCredentials.admin.email);
  const [password, setPassword] = useState(demoCredentials.admin.password);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (auth && !auth.app.options.apiKey.startsWith('YOUR_')) {
        try {
          await signInWithFirebase(normalizedEmail, password);
        } catch (firebaseErr) {
          console.warn('Firebase login skipped:', firebaseErr.message);
        }
      }

      const res = await axios.post(`${API_BASE_URL}/login`, { role, email: normalizedEmail, password });
      if (res.data.role === 'admin') navigate('/admin');
      if (res.data.role === 'driver') navigate('/driver');
      if (res.data.role === 'student') navigate('/student');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 className="text-3xl font-semibold">Login Portal</h2>
      <p className="mt-2 text-slate-600">Choose your role to access the relevant dashboard.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <select
          value={role}
          onChange={(e) => {
            const nextRole = e.target.value;
            setRole(nextRole);
            setEmail(demoCredentials[nextRole].email);
            setPassword(demoCredentials[nextRole].password);
          }}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3"
        >
          <option value="admin">Admin</option>
          <option value="driver">Driver</option>
          <option value="student">Student</option>
        </select>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="Password" />
        <button className="w-full rounded-2xl bg-cyan-700 px-4 py-3 font-semibold text-white">Sign In</button>
      </form>
    </div>
  );
};

export default LoginPage;
