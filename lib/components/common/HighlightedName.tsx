const HighlightedName = ({
  name,
  query,
  className,
}: {
  name: string;
  query: string;
  className?: string;
}) => {
  const idx = query.trim() ? name.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (idx === -1) return <span className={className}>{name}</span>;
  return (
    <span className={className}>
      <span className="font-normal">{name.slice(0, idx)}</span>
      <span className="font-bold">{name.slice(idx, idx + query.length)}</span>
      <span className="font-normal">{name.slice(idx + query.length)}</span>
    </span>
  );
};

export default HighlightedName;
