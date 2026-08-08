import { useEffect, useState } from 'react';
import { getReports, getUsers, verifyUser, deleteUser, getAllArenasAdmin, updateArena, deleteArena } from '../../api/services';

const TABS = ['Overview', 'Verify owners', 'Users', 'Arenas'];

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-court-line bg-white p-5">
    <p className="text-xs uppercase tracking-wide text-court-ink/50 font-semibold">{label}</p>
    <p className="font-display font-bold text-2xl mt-1">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState('Overview');
  const [reports, setReports] = useState(null);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [users, setUsers] = useState([]);
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = () => Promise.all([
    getReports().then(({ data }) => setReports(data)),
    getUsers({ role: 'arena_owner' }).then(({ data }) => setPendingOwners(data.filter((u) => !u.isVerified))),
    getUsers().then(({ data }) => setUsers(data)),
    getAllArenasAdmin().then(({ data }) => setArenas(data)),
  ]);

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, []);

  const handleVerify = async (id) => { await verifyUser(id); loadAll(); };
  const handleDeleteUser = async (id) => { await deleteUser(id); loadAll(); };
  const handleArenaStatus = async (id, status) => { await updateArena(id, { status }); loadAll(); };
  const handleDeleteArena = async (id) => { await deleteArena(id); loadAll(); };

  if (loading) return <p className="max-w-5xl mx-auto px-6 py-16 text-court-ink/50 text-sm">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-3xl">Admin dashboard</h1>

      <div className="flex gap-2 mt-6 border-b border-court-line">
        {TABS.map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-court-primary text-court-primary' : 'border-transparent text-court-ink/50 hover:text-court-ink'
            }`}
          >
            {t}{t === 'Verify owners' && pendingOwners.length > 0 ? ` (${pendingOwners.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'Overview' && reports && (
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <StatCard label="Total users" value={reports.totalUsers} />
          <StatCard label="Arena owners" value={reports.totalOwners} />
          <StatCard label="Owners pending verification" value={reports.pendingOwners} />
          <StatCard label="Total arenas" value={reports.totalArenas} />
          <StatCard label="Approved arenas" value={reports.approvedArenas} />
          <StatCard label="Arenas pending review" value={reports.pendingArenas} />
          <StatCard label="Total bookings" value={reports.totalBookings} />
          <StatCard label="Platform revenue" value={`₹${reports.totalRevenue}`} />
        </div>
      )}

      {tab === 'Verify owners' && (
        <div className="mt-6 space-y-3">
          {pendingOwners.length === 0 ? (
            <p className="text-sm text-court-ink/50">No owners waiting for verification.</p>
          ) : (
            pendingOwners.map((o) => (
              <div key={o._id} className="flex items-center justify-between rounded-xl border border-court-line bg-white p-4">
                <div>
                  <p className="font-semibold">{o.name}</p>
                  <p className="text-sm text-court-ink/60">{o.email} {o.phone && `· ${o.phone}`}</p>
                </div>
                <button onClick={() => handleVerify(o._id)} className="px-4 py-2 rounded-full bg-court-primary text-white text-sm font-semibold hover:bg-court-primary-dark transition-colors">
                  Verify
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Users' && (
        <div className="mt-6 space-y-2">
          {users.map((u) => (
            <div key={u._id} className="flex items-center justify-between rounded-xl border border-court-line bg-white p-3.5">
              <div>
                <p className="font-medium text-sm">{u.name} <span className="text-court-ink/40 capitalize">· {u.role}</span></p>
                <p className="text-xs text-court-ink/50">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {u.role === 'arena_owner' && !u.isVerified && (
                  <button onClick={() => handleVerify(u._id)} className="text-sm font-medium text-court-primary hover:underline">Verify</button>
                )}
                {u.role !== 'admin' && (
                  <button onClick={() => handleDeleteUser(u._id)} className="text-sm font-medium text-court-danger hover:underline">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Arenas' && (
        <div className="mt-6 space-y-2">
          {arenas.map((a) => (
            <div key={a._id} className="flex items-center justify-between rounded-xl border border-court-line bg-white p-3.5">
              <div>
                <p className="font-medium text-sm">{a.name} <span className="text-court-ink/40">· {a.location?.city}</span></p>
                <p className="text-xs text-court-ink/50">Owner: {a.ownerId?.name} ({a.ownerId?.email})</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                  a.status === 'approved' ? 'bg-court-primary/10 text-court-primary'
                  : a.status === 'rejected' ? 'bg-court-danger/10 text-court-danger'
                  : 'bg-court-accent/20 text-court-accent-dark'
                }`}>{a.status}</span>
                {a.status !== 'approved' && (
                  <button onClick={() => handleArenaStatus(a._id, 'approved')} className="text-sm font-medium text-court-primary hover:underline">Approve</button>
                )}
                {a.status !== 'rejected' && (
                  <button onClick={() => handleArenaStatus(a._id, 'rejected')} className="text-sm font-medium text-court-ink/50 hover:underline">Reject</button>
                )}
                <button onClick={() => handleDeleteArena(a._id)} className="text-sm font-medium text-court-danger hover:underline">Remove listing</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
