import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArenaById, getCourts, createBooking, createPaymentOrder, verifyPayment } from '../api/services';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const { arenaId, courtId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [arena, setArena] = useState(null);
  const [court, setCourt] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | booking | paying | confirmed | error
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getArenaById(arenaId), getCourts({ arenaId })])
      .then(([a, c]) => {
        setArena(a.data);
        setCourt(c.data.find((ct) => ct._id === courtId) || null);
      })
      .finally(() => setLoading(false));
  }, [arenaId, courtId]);

  const openSlots = (court?.availableSlots || []).filter((s) => !s.isBooked);
  const slotsByDate = openSlots.reduce((acc, s) => {
    acc[s.date] = acc[s.date] || [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const handleConfirm = async () => {
    if (!user) return navigate('/login', { state: { from: `/book/${arenaId}/${courtId}` } });
    if (!selectedSlot) return;

    setError('');
    setStatus('booking');
    try {
      const { data: booking } = await createBooking({
        arenaId, courtId, date: selectedSlot.date, time: selectedSlot.time,
      });

      setStatus('paying');
      const { data: orderData } = await createPaymentOrder({ bookingId: booking._id });

      const rzp = new window.Razorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.id,
        name: 'ArenaHub',
        description: `${court.name} · ${selectedSlot.date} ${selectedSlot.time}`,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#16453A' },
        handler: async (response) => {
          try {
            await verifyPayment({ bookingId: booking._id, ...response });
            setStatus('confirmed');
          } catch {
            setError('Payment succeeded but verification failed — contact support.');
            setStatus('error');
          }
        },
        modal: { ondismiss: () => setStatus('idle') },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setStatus('error');
    }
  };

  if (loading) return <p className="max-w-3xl mx-auto px-6 py-16 text-court-ink/50 text-sm">Loading…</p>;
  if (!arena || !court) return <p className="max-w-3xl mx-auto px-6 py-16 text-court-ink/50 text-sm">Court not found.</p>;

  if (status === 'confirmed') {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-court-primary/10 text-court-primary flex items-center justify-center mx-auto text-2xl font-display font-bold">✓</div>
        <h1 className="font-display font-bold text-2xl mt-5">Booking confirmed</h1>
        <p className="text-court-ink/60 mt-2 text-sm">
          {court.name} at {arena.name} · {selectedSlot.date} · {selectedSlot.time}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 px-6 py-3 rounded-full bg-court-primary text-white font-semibold hover:bg-court-primary-dark transition-colors"
        >
          View my bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-3xl">Book {court.name}</h1>
      <p className="text-court-ink/60 mt-1">{arena.name} · {arena.location?.city} · ₹{court.pricePerHour}/hr</p>

      <div className="mt-8">
        <h2 className="font-display font-semibold text-lg mb-3">Choose a slot</h2>
        {Object.keys(slotsByDate).length === 0 ? (
          <p className="text-sm text-court-ink/50">No open slots right now.</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date}>
                <p className="text-sm font-semibold text-court-ink/70">{date}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {slots.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => setSelectedSlot(s)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        selectedSlot?._id === s._id
                          ? 'bg-court-primary text-white border-court-primary'
                          : 'border-court-line hover:border-court-primary hover:text-court-primary'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-court-danger mt-4">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={!selectedSlot || status === 'booking' || status === 'paying'}
        className="mt-8 w-full sm:w-auto px-8 py-3.5 rounded-full bg-court-accent text-court-primary-dark font-semibold hover:bg-court-accent-dark transition-colors disabled:opacity-50"
      >
        {status === 'booking' ? 'Reserving slot…' : status === 'paying' ? 'Opening payment…' : `Confirm & pay ₹${court.pricePerHour}`}
      </button>
    </div>
  );
};

export default Booking;
