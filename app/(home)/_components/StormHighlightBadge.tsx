import { getStormHighlight } from "@/lib/db/api/getStormHighlight";
import { capitalize } from "@/lib/utils/format";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import Link from "next/link";

const CONTAINER_CLASS = "mb-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm";
const PILL_CLASS =
  "inline-flex min-w-26 items-center justify-center gap-1.5 rounded-full bg-white/70 px-3 py-1 shadow-sm";

export const StormHighlightBadgeSkeleton = () => (
  <div
    className={`${CONTAINER_CLASS} animate-pulse`}
    role="status"
    aria-label="Loading storm highlight"
  >
    <span className={`${PILL_CLASS} text-slate-400`} aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-slate-300" />…
    </span>
    <span className="text-slate-400" aria-hidden="true">
      …
    </span>
    <span className="text-slate-400" aria-hidden="true">
      …
    </span>
  </div>
);

const StormHighlightBadge = async () => {
  // The badge is decorative: a database hiccup should hide it, not fail the homepage.
  const highlight = await getStormHighlight()
    .then((res) => res.data)
    .catch(() => null);

  if (!highlight) {
    return null;
  }

  const isActive = highlight.status === "active";

  return (
    <div className={CONTAINER_CLASS}>
      <span className={`${PILL_CLASS} ${isActive ? "text-red-600" : "text-blue-600"}`}>
        <span
          className={`h-2 w-2 rounded-full ${isActive ? "bg-red-500" : "bg-blue-500"}`}
          aria-hidden="true"
        />
        {isActive ? "Active now" : "Up next"}
      </span>

      <Link
        href={`/info/${encodeURIComponent(highlight.name.toLowerCase())}`}
        className="font-semibold text-purple-700 transition-colors hover:text-purple-800"
      >
        {capitalize(highlight.name.toLowerCase())}
      </Link>

      <Link
        href={`/positions/${getPositionSlug(highlight.position)}`}
        className="text-teal-700 transition-colors hover:text-teal-800"
      >
        {getPositionTitle(highlight.position)}
      </Link>
    </div>
  );
};

export default StormHighlightBadge;
