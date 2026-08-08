import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArenas } from '../api/services';
import ArenaCard from '../components/ArenaCard';

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Swimming'];

const Landing = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArenas()
      .then(({ data }) => setFeatured(data.slice(0, 6)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search${city ? `?city=${encodeURIComponent(city)}` : ''}`);
  };

  return (
    <div>
      <section className="bg-court-primary text-white">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <p className="uppercase tracking-[0.2em] text-xs text-court-accent font-semibold mb-4">
            Book a court in under two minutes
          </p>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] max-w-2xl">
            Find your court. Reserve the slot. Show up and play.
          </h1>
          <p className="mt-5 text-white/70 max-w-lg">
            Search verified arenas near you, compare courts and equipment, and lock in a slot with secure online payment.
          </p>

          <form onSubmit={handleSearch} className="mt-9 flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search by city, e.g. Bengaluru"
              className="flex-1 px-5 py-3.5 rounded-full text-court-ink placeholder:text-court-ink/40 focus:outline-none focus:ring-2 focus:ring-court-accent"
            />
            <button
              type="submit"
              className="px-7 py-3.5 rounded-full bg-court-accent text-court-primary-dark font-semibold hover:bg-court-accent-dark transition-colors"
            >
              Search arenas
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-court-ink/50 mb-5">
          Popular sports
        </h2>
        <div className="flex flex-wrap gap-3">
          {SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => navigate(`/search?sport=${encodeURIComponent(sport)}`)}
              className="px-5 py-2.5 rounded-full border border-court-line bg-white hover:border-court-primary hover:text-court-primary font-medium text-sm transition-colors"
            >
              {sport}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-court-ink/50">
            Featured arenas
          </h2>
          <a href="/search" className="text-sm text-court-primary font-medium hover:underline">View all</a>
        </div>

        {loading ? (
          <p className="text-court-ink/50 text-sm">Loading arenas…</p>
        ) : featured.length === 0 ? (
          <p className="text-court-ink/50 text-sm">No approved arenas yet — check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((arena) => <ArenaCard key={arena._id} arena={arena} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Landing;
