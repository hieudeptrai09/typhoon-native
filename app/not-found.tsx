import TyphoonSymbol from "@/lib/components/TyphoonSpinner/TyphoonSymbol";
import { Home, Tag, Wind } from "lucide-react";
import Link from "next/link";
import "./not-found.css";

const NotFound = () => {
  return (
    <main className="flex h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200 px-6 text-center">
      {/* 404 — the typhoon swirl stands in for the middle "0" */}
      <h1
        aria-label="404 — Page not found"
        className="mb-6 flex items-center justify-center gap-3 select-none sm:gap-4"
      >
        <span aria-hidden className="text-8xl font-black text-sky-800 tabular-nums sm:text-9xl">
          4
        </span>
        <TyphoonSymbol className="nf-swirl h-20 w-20 text-sky-700 sm:h-28 sm:w-28" />
        <span aria-hidden className="text-8xl font-black text-sky-800 tabular-nums sm:text-9xl">
          4
        </span>
      </h1>

      <p className="mb-2 text-2xl font-bold text-foreground">This page drifted off the map</p>
      <p className="mb-10 max-w-md text-base text-slate-600">
        It may have moved, or been swept away by a storm.
        <br />
        Let&rsquo;s get you back on course.
      </p>

      {/* Lightweight links, not heavy buttons, so a dead end still feels calm */}
      <nav
        aria-label="Suggested pages"
        className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-base font-semibold"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sky-700 transition-colors hover:text-sky-900"
        >
          <Home aria-hidden size={18} />
          Home
        </Link>
        <Link
          href="/storms/all/name/"
          className="inline-flex items-center gap-1.5 text-sky-700 transition-colors hover:text-sky-900"
        >
          <Wind aria-hidden size={18} />
          Browse storms
        </Link>
        <Link
          href="/names/current/"
          className="inline-flex items-center gap-1.5 text-sky-700 transition-colors hover:text-sky-900"
        >
          <Tag aria-hidden size={18} />
          Explore names
        </Link>
      </nav>
    </main>
  );
};

export default NotFound;
