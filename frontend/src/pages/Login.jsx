import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const dashboardPath = { customer: '/dashboard', arena_owner: '/owner', admin: '/admin' };

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(location.state?.from || dashboardPath[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl">Log in</h1>
      <p className="text-court-ink/60 mt-2 text-sm">Welcome back — book your next slot.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-court-line focus:outline-none focus:ring-2 focus:ring-court-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-court-line focus:outline-none focus:ring-2 focus:ring-court-primary"
          />
        </div>

        {error && <p className="text-sm text-court-danger">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 rounded-full bg-court-primary text-white font-semibold hover:bg-court-primary-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-court-ink/60 mt-6">
        New to ArenaHub? <Link to="/register" className="text-court-primary font-medium hover:underline">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
