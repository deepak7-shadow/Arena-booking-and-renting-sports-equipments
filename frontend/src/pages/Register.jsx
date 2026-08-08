import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const dashboardPath = { customer: '/dashboard', arena_owner: '/owner' };

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(form);
      navigate(dashboardPath[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl">Create your account</h1>
      <p className="text-court-ink/60 mt-2 text-sm">Book courts as a player, or list your arena as an owner.</p>

      <div className="mt-6 flex rounded-full border border-court-line p-1 bg-white">
        {[['customer', 'Customer'], ['arena_owner', 'Arena Owner']].map(([value, label]) => (
          <button
            key={value} type="button"
            onClick={() => setForm({ ...form, role: value })}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              form.role === value ? 'bg-court-primary text-white' : 'text-court-ink/60 hover:text-court-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-court-line focus:outline-none focus:ring-2 focus:ring-court-primary" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-court-line focus:outline-none focus:ring-2 focus:ring-court-primary" />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-court-line focus:outline-none focus:ring-2 focus:ring-court-primary" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full px-4 py-3 rounded-xl border border-court-line focus:outline-none focus:ring-2 focus:ring-court-primary" />
        </div>

        {error && <p className="text-sm text-court-danger">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-full bg-court-primary text-white font-semibold hover:bg-court-primary-dark transition-colors disabled:opacity-60">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-court-ink/60 mt-6">
        Already have an account? <Link to="/login" className="text-court-primary font-medium hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
