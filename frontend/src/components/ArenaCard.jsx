import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const ArenaCard = ({ arena }) => (
  <Link
    to={`/arenas/${arena._id}`}
    className="group block rounded-2xl border border-court-line bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
  >
    <div className="aspect-[4/3] bg-court-primary/10 flex items-center justify-center overflow-hidden">
      {arena.images?.[0] ? (
        <img src={arena.images[0]} alt={arena.name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-display text-court-primary/40 text-sm">No image yet</span>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-court-primary transition-colors">
          {arena.name}
        </h3>
        <StarRating value={arena.rating} size="text-sm" />
      </div>
      <p className="text-sm text-court-ink/60 mt-1">{arena.location?.city}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {arena.sportsAvailable?.slice(0, 4).map((sport) => (
          <span key={sport} className="text-xs px-2 py-1 rounded-full bg-court-primary/10 text-court-primary font-medium capitalize">
            {sport}
          </span>
        ))}
      </div>
    </div>
  </Link>
);

export default ArenaCard;
