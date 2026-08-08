import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArenaById, getCourts, getEquipment, getArenaReviews, createReview } from '../api/services';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

const ArenaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [arena, setArena] = useState(null);
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReviews = () => getArenaReviews(id).then(({ data }) => setReviews(data));

  useEffect(() => {
    Promise.all([
      getArenaById(id),
      getCourts({ arenaId: id }),
      getEquipment({ arenaId: id }),
      getArenaReviews(id),
    ])
      .then(([a, c, e, r]) => {
        setArena(a.data);
        setCourts(c.data);
        setEquipment(e.data);
        setReviews(r.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await createReview(id, reviewForm);
      setReviewForm({ rating: 5, comment: '' });
      await loadReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review');
    }
  };

  if (loading) return <p className="max-w-6xl mx-auto px-6 py-16 text-court-ink/50 text-sm">Loading arena…</p>;
  if (!arena) return <p className="max-w-6xl mx-auto px-6 py-16 text-court-ink/50 text-sm">Arena not found.</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="aspect-[21/9] rounded-2xl bg-court-primary/10 overflow-hidden flex items-center justify-center">
        {arena.images?.[0] ? (
          <img src={arena.images[0]} alt={arena.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-court-primary/40">No images yet</span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">{arena.name}</h1>
          <p className="text-court-ink/60 mt-1">{arena.location?.address}, {arena.location?.city}</p>
          <div className="flex items-center gap-2 mt-2">
            <StarRating value={arena.rating} />
            <span className="text-sm text-court-ink/50">({reviews.length} reviews)</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {arena.sportsAvailable?.map((sport) => (
            <span key={sport} className="text-xs px-2.5 py-1 rounded-full bg-court-primary/10 text-court-primary font-medium capitalize">
              {sport}
            </span>
          ))}
        </div>
      </div>

      {arena.description && <p className="mt-5 text-court-ink/75 max-w-2xl">{arena.description}</p>}

      {/* Courts */}
      <section className="mt-12">
        <h2 className="font-display font-semibold text-xl">Courts &amp; pricing</h2>
        {courts.length === 0 ? (
          <p className="text-sm text-court-ink/50 mt-3">No courts listed yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {courts.map((court) => (
              <div key={court._id} className="rounded-xl border border-court-line bg-white p-5">
                <p className="font-semibold">{court.name}</p>
                <p className="text-sm text-court-ink/60 capitalize">{court.sport}</p>
                <p className="mt-3 font-display font-bold text-court-primary">₹{court.pricePerHour}/hr</p>
                <button
                  onClick={() => navigate(`/book/${arena._id}/${court._id}`)}
                  className="mt-4 w-full py-2.5 rounded-full bg-court-primary text-white text-sm font-semibold hover:bg-court-primary-dark transition-colors"
                >
                  Book this court
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Equipment */}
      <section className="mt-12">
        <h2 className="font-display font-semibold text-xl">Equipment for rent</h2>
        {equipment.length === 0 ? (
          <p className="text-sm text-court-ink/50 mt-3">No equipment listed yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {equipment.map((item) => (
              <div key={item._id} className="rounded-xl border border-court-line bg-white p-4">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-court-ink/50 capitalize mt-0.5">{item.condition} · {item.quantity} in stock</p>
                <p className="mt-2 font-display font-bold text-court-primary text-sm">₹{item.pricePerHour}/hr</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="mt-12 pb-16">
        <h2 className="font-display font-semibold text-xl">Ratings &amp; reviews</h2>

        {user?.role === 'customer' && (
          <form onSubmit={submitReview} className="mt-4 max-w-lg rounded-xl border border-court-line bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Your rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                className="px-2 py-1 rounded-lg border border-court-line text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 && 's'}</option>)}
              </select>
            </div>
            <textarea
              placeholder="Share your experience…"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-court-line text-sm focus:outline-none focus:ring-2 focus:ring-court-primary"
              rows={3}
            />
            {reviewError && <p className="text-sm text-court-danger">{reviewError}</p>}
            <button type="submit" className="px-5 py-2 rounded-full bg-court-primary text-white text-sm font-semibold hover:bg-court-primary-dark transition-colors">
              Post review
            </button>
          </form>
        )}
        {!user && (
          <p className="text-sm text-court-ink/50 mt-3">
            <Link to="/login" className="text-court-primary font-medium hover:underline">Log in</Link> as a customer to leave a review.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-court-ink/50">No reviews yet — be the first.</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="border-b border-court-line pb-4">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} size="text-sm" />
                  <span className="text-sm font-medium">{r.user?.name}</span>
                </div>
                {r.comment && <p className="text-sm text-court-ink/70 mt-1">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ArenaDetails;
