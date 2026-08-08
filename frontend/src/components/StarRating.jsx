const StarRating = ({ value = 0, size = 'text-base' }) => {
  const rounded = Math.round(value);
  return (
    <span className={`${size} text-court-accent-dark tracking-tight`} aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(rounded)}
      <span className="text-court-line">{'★'.repeat(5 - rounded)}</span>
    </span>
  );
};

export default StarRating;
