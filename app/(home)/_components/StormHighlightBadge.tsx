"use client";

import type { StormHighlight } from "@/lib/types";
import { capitalize } from "@/lib/utils/format";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import { Activity, Clock, RotateCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { fetchStormHighlights } from "../_actions";

const ROW_CLASS = "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm";
const PILL_CLASS =
  "inline-flex min-w-26 items-center justify-center gap-1.5 rounded-full bg-white/70 px-3 py-1 shadow-sm";
const REFRESH_CLASS =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-slate-800 disabled:text-slate-300";

const pickIndex = (highlights: StormHighlight[], currentName?: string): number => {
  const others = highlights.flatMap((storm, i) => (storm.name === currentName ? [] : [i]));

  if (others.length === 0) return 0;

  return others[Math.floor(Math.random() * others.length)];
};

const StormHighlightBadge = ({ initial }: { initial: StormHighlight[] }) => {
  const [highlights, setHighlights] = useState(initial);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const highlight = highlights[index];

  const refresh = async () => {
    setLoading(true);
    try {
      const fresh = await fetchStormHighlights();
      if (fresh.length > 0) {
        setHighlights(fresh);
        setIndex(pickIndex(fresh, highlight?.name));
      }
    } catch {
      // The badge is decorative: a failed refresh leaves the current storm in place.
    } finally {
      setLoading(false);
    }
  };

  if (!highlight) return null;

  const isActive = highlight.status === "active";

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      <div className={ROW_CLASS}>
        <span className={`${PILL_CLASS} ${isActive ? "text-red-600" : "text-blue-600"}`}>
          {isActive ? <Activity size={14} aria-hidden /> : <Clock size={14} aria-hidden />}
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

      <button
        type="button"
        onClick={refresh}
        disabled={loading}
        aria-label="Refresh storms"
        aria-busy={loading}
        className={REFRESH_CLASS}
      >
        <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
      </button>
    </div>
  );
};

export default StormHighlightBadge;
