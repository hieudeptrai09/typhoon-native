import Link from "next/link";

// Fuzzy-matched alternatives for a name that wasn't found. Renders nothing when nothing
// came close, so callers can drop it in unconditionally.
const DidYouMean = ({ names }: { names: string[] }) => {
  if (names.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="mb-3 text-sm font-semibold text-foreground">Did you mean</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {names.map((name) => (
          <li key={name}>
            <Link
              href={`/info/${encodeURIComponent(name.toLowerCase())}/`}
              className="inline-block rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 capitalize transition-colors hover:text-sky-700!"
            >
              {name.toLowerCase()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DidYouMean;
