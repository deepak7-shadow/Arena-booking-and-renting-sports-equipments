import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getArenas } from '../api/services';
import ArenaCard from '../components/ArenaCard';

const Search = () => {
  const [params, setParams] = useSearchParams();
  const [city, setCity] = useState(params.get('city') || '');
  const [sport, setSport] = useState(params.get('sport') || '');
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = {};
    if (params.get('city')) query.city = params.get('city');
    if (params.get('sport')) query.sport = params.get('sport');
    getArenas(query)
      .then(({ data }) => setArenas(data))
      .catch(() => setArenas([]))
      .finally(() => setLoading(false));
  }, [params]);

  const applyFilters = (e) => {
    e.preventDefault();
    const next = {};
    if (city) next.city = city;
    if (sport) next.sport = sport;
    setParams(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-3xl">Find an arena</h1>

      <form onSubmit={applyFilters} className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
          className="flex-1 px-4 py-3 rounded-xl border border-court-line focus:outline-none focus:ring-2 focus:ring-court-primary"
        />
        <input
          value={sport} onChange={(e) => setSport(e.target.value)} placeholder="Sport (e.g. Cricket)"
          className="flex-1 px-4 py-3 rounded-xl border border-court-line focus:outline-none focus:ring-2 focus:ring-court-primary"
        />
        <button type="submit" className="px-6 py-3 rounded-xl bg-court-primary text-white font-semibold hover:bg-court-primary-dark transition-colors">
          Filter
        </button>
      </form>

      <div className="mt-8">
        {loading ? (
          <p className="text-court-ink/50 text-sm">Searching…</p>
        ) : arenas.length === 0 ? (
          <p className="text-court-ink/50 text-sm">No arenas match your filters yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {arenas.map((arena) => <ArenaCard key={arena._id} arena={arena} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
