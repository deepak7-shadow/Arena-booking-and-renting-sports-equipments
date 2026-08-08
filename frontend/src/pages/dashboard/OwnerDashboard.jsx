import { useEffect, useState } from 'react';
import { getMyArenas, createArena, createCourt, createEquipment, getBookings, getCourts, addCourtSlots } from '../../api/services';

const statusStyles = {
  pending: 'bg-court-accent/20 text-court-accent-dark',
  confirmed: 'bg-court-primary/10 text-court-primary',
  cancelled: 'bg-court-danger/10 text-court-danger',
  completed: 'bg-court-ink/10 text-court-ink/60',
};

const emptyArena = { name: '', city: '', address: '', sportsAvailable: '', description: '' };
const emptyCourt = { arenaId: '', name: '', sport: '', pricePerHour: '' };
const emptyEquipment = { arenaId: '', name: '', sport: '', pricePerHour: '', quantity: '', condition: 'good' };
const emptySlot = { courtId: '', date: '', time: '' };

const OwnerDashboard = () => {
  const [arenas, setArenas] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [arenaForm, setArenaForm] = useState(emptyArena);
  const [courtForm, setCourtForm] = useState(emptyCourt);
  const [equipForm, setEquipForm] = useState(emptyEquipment);
  const [slotForm, setSlotForm] = useState(emptySlot);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [{ data: myArenas }, { data: myBookings }] = await Promise.all([getMyArenas(), getBookings()]);
    setArenas(myArenas);
    setBookings(myBookings);

    const courtLists = await Promise.all(myArenas.map((a) => getCourts({ arenaId: a._id })));
    setCourts(courtLists.flatMap((res) => res.data));
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const earnings = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.amount, 0);

  const handleCreateArena = async (e) => {
    e.preventDefault();
    setMsg('');
    await createArena({
      name: arenaForm.name,
      location: { address: arenaForm.address, city: arenaForm.city },
      sportsAvailable: arenaForm.sportsAvailable.split(',').map((s) => s.trim()).filter(Boolean),
      description: arenaForm.description,
    });
    setArenaForm(emptyArena);
    setMsg('Arena submitted — pending admin verification.');
    load();
  };

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    setMsg('');
    await createCourt({ ...courtForm, pricePerHour: Number(courtForm.pricePerHour) });
    setCourtForm(emptyCourt);
    setMsg('Court added — add slots below so customers can book it.');
    load();
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setMsg('');
    await addCourtSlots(slotForm.courtId, [{ date: slotForm.date, time: slotForm.time }]);
    setSlotForm(emptySlot);
    setMsg('Slot added.');
    load();
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    setMsg('');
    await createEquipment({
      ...equipForm,
      pricePerHour: Number(equipForm.pricePerHour),
      quantity: Number(equipForm.quantity),
    });
    setEquipForm(emptyEquipment);
    setMsg('Equipment added.');
  };

  if (loading) return <p className="max-w-5xl mx-auto px-6 py-16 text-court-ink/50 text-sm">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-3xl">Owner dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <div className="rounded-xl border border-court-line bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-court-ink/50 font-semibold">Arenas</p>
          <p className="font-display font-bold text-2xl mt-1">{arenas.length}</p>
        </div>
        <div className="rounded-xl border border-court-line bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-court-ink/50 font-semibold">Bookings</p>
          <p className="font-display font-bold text-2xl mt-1">{bookings.length}</p>
        </div>
        <div className="rounded-xl border border-court-line bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-court-ink/50 font-semibold">Earnings</p>
          <p className="font-display font-bold text-2xl mt-1 text-court-primary">₹{earnings}</p>
        </div>
      </div>

      {msg && <p className="text-sm text-court-primary mt-4">{msg}</p>}

      {/* My arenas + bookings */}
      <section className="mt-10">
        <h2 className="font-display font-semibold text-xl">My arenas</h2>
        {arenas.length === 0 ? (
          <p className="text-sm text-court-ink/50 mt-2">No arenas yet — register one below.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {arenas.map((a) => (
              <div key={a._id} className="rounded-xl border border-court-line bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{a.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                    a.status === 'approved' ? 'bg-court-primary/10 text-court-primary'
                    : a.status === 'rejected' ? 'bg-court-danger/10 text-court-danger'
                    : 'bg-court-accent/20 text-court-accent-dark'
                  }`}>{a.status}</span>
                </div>
                <p className="text-sm text-court-ink/60">{a.location?.city}</p>
              </div>
            ))}
          </div>
        )}

        <h3 className="font-display font-semibold text-lg mt-8">My courts</h3>
        {courts.length === 0 ? (
          <p className="text-sm text-court-ink/50 mt-2">No courts yet — add one below.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {courts.map((c) => {
              const open = c.availableSlots.filter((s) => !s.isBooked).length;
              return (
                <div key={c._id} className="rounded-xl border border-court-line bg-white p-4">
                  <p className="font-semibold">{c.name} <span className="text-court-ink/40 capitalize">· {c.sport}</span></p>
                  <p className="text-sm text-court-ink/60 mt-0.5">₹{c.pricePerHour}/hr · {open} open slot{open !== 1 && 's'}</p>
                </div>
              );
            })}
          </div>
        )}

        <h3 className="font-display font-semibold text-lg mt-8">Recent bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-court-ink/50 mt-2">No bookings yet.</p>
        ) : (
          <div className="space-y-2 mt-3">
            {bookings.slice(0, 8).map((b) => (
              <div key={b._id} className="flex items-center justify-between rounded-xl border border-court-line bg-white p-3.5">
                <p className="text-sm">{b.arenaId?.name} · {b.courtId?.name} · {b.date} {b.time}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusStyles[b.status]}`}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Forms */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <form onSubmit={handleCreateArena} className="rounded-xl border border-court-line bg-white p-5 space-y-3">
          <h3 className="font-display font-semibold">Register arena</h3>
          <input required placeholder="Arena name" value={arenaForm.name} onChange={(e) => setArenaForm({ ...arenaForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required placeholder="City" value={arenaForm.city} onChange={(e) => setArenaForm({ ...arenaForm, city: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required placeholder="Address" value={arenaForm.address} onChange={(e) => setArenaForm({ ...arenaForm, address: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required placeholder="Sports (comma separated)" value={arenaForm.sportsAvailable} onChange={(e) => setArenaForm({ ...arenaForm, sportsAvailable: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <textarea placeholder="Description" value={arenaForm.description} onChange={(e) => setArenaForm({ ...arenaForm, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" rows={2} />
          <button className="w-full py-2.5 rounded-full bg-court-primary text-white text-sm font-semibold hover:bg-court-primary-dark transition-colors">Submit arena</button>
        </form>

        <form onSubmit={handleCreateCourt} className="rounded-xl border border-court-line bg-white p-5 space-y-3">
          <h3 className="font-display font-semibold">Add court</h3>
          <select required value={courtForm.arenaId} onChange={(e) => setCourtForm({ ...courtForm, arenaId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm">
            <option value="">Select arena</option>
            {arenas.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <input required placeholder="Court name" value={courtForm.name} onChange={(e) => setCourtForm({ ...courtForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required placeholder="Sport" value={courtForm.sport} onChange={(e) => setCourtForm({ ...courtForm, sport: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required type="number" placeholder="Price per hour" value={courtForm.pricePerHour} onChange={(e) => setCourtForm({ ...courtForm, pricePerHour: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <button className="w-full py-2.5 rounded-full bg-court-primary text-white text-sm font-semibold hover:bg-court-primary-dark transition-colors">Add court</button>
        </form>

        <form onSubmit={handleCreateEquipment} className="rounded-xl border border-court-line bg-white p-5 space-y-3">
          <h3 className="font-display font-semibold">Add equipment</h3>
          <select required value={equipForm.arenaId} onChange={(e) => setEquipForm({ ...equipForm, arenaId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm">
            <option value="">Select arena</option>
            {arenas.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <input required placeholder="Equipment name" value={equipForm.name} onChange={(e) => setEquipForm({ ...equipForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required placeholder="Sport" value={equipForm.sport} onChange={(e) => setEquipForm({ ...equipForm, sport: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required type="number" placeholder="Price per hour" value={equipForm.pricePerHour} onChange={(e) => setEquipForm({ ...equipForm, pricePerHour: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required type="number" placeholder="Quantity" value={equipForm.quantity} onChange={(e) => setEquipForm({ ...equipForm, quantity: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <button className="w-full py-2.5 rounded-full bg-court-primary text-white text-sm font-semibold hover:bg-court-primary-dark transition-colors">Add equipment</button>
        </form>

        <form onSubmit={handleAddSlot} className="rounded-xl border border-court-line bg-white p-5 space-y-3">
          <h3 className="font-display font-semibold">Open a booking slot</h3>
          <select required value={slotForm.courtId} onChange={(e) => setSlotForm({ ...slotForm, courtId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm">
            <option value="">Select court</option>
            {courts.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input required type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <input required placeholder="Time, e.g. 18:00-19:00" value={slotForm.time} onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-court-line text-sm" />
          <button className="w-full py-2.5 rounded-full bg-court-primary text-white text-sm font-semibold hover:bg-court-primary-dark transition-colors">Add slot</button>
        </form>
      </div>
    </div>
  );
};

export default OwnerDashboard;
