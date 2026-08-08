import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, getRentals, returnRental } from '../../api/services';

const statusStyles = {
  pending: 'bg-court-accent/20 text-court-accent-dark',
  confirmed: 'bg-court-primary/10 text-court-primary',
  cancelled: 'bg-court-danger/10 text-court-danger',
  completed: 'bg-court-ink/10 text-court-ink/60',
  active: 'bg-court-accent/20 text-court-accent-dark',
  returned: 'bg-court-ink/10 text-court-ink/60',
  overdue: 'bg-court-danger/10 text-court-danger',
};

const Badge = ({ status }) => (
  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[status] || ''}`}>
    {status}
  </span>
);

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([getBookings(), getRentals()]).then(([b, r]) => {
    setBookings(b.data);
    setRentals(r.data);
  });

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleReturn = async (id) => {
    await returnRental(id);
    load();
  };

  if (loading) return <p className="max-w-5xl mx-auto px-6 py-16 text-court-ink/50 text-sm">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-3xl">My bookings</h1>

      <section className="mt-8">
        {bookings.length === 0 ? (
          <p className="text-sm text-court-ink/50">
            No bookings yet — <Link to="/search" className="text-court-primary font-medium hover:underline">find an arena</Link>.
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="flex items-center justify-between rounded-xl border border-court-line bg-white p-4">
                <div>
                  <p className="font-semibold">{b.arenaId?.name} · {b.courtId?.name}</p>
                  <p className="text-sm text-court-ink/60">{b.date} · {b.time} · ₹{b.amount}</p>
                </div>
                <Badge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <h2 className="font-display font-semibold text-xl mt-12">Equipment rentals</h2>
      <section className="mt-4">
        {rentals.length === 0 ? (
          <p className="text-sm text-court-ink/50">No equipment rentals yet.</p>
        ) : (
          <div className="space-y-3">
            {rentals.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-xl border border-court-line bg-white p-4">
                <div>
                  <p className="font-semibold">{r.equipmentId?.name} × {r.quantity}</p>
                  <p className="text-sm text-court-ink/60">Return by {new Date(r.returnDate).toLocaleDateString()} · Deposit ₹{r.deposit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={r.status} />
                  {r.status === 'active' && (
                    <button
                      onClick={() => handleReturn(r._id)}
                      className="text-sm font-medium text-court-primary hover:underline"
                    >
                      Mark returned
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerDashboard;
