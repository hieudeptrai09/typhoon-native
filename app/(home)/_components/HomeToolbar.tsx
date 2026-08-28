"use client";

import SearchBar from "@/lib/components/SearchBar";
import FunFacts from "./FunFacts";

const HomeToolbar = ({ allNames }: { allNames: string[] }) => (
  <div className="relative mb-4 flex w-full max-w-sm items-center gap-2">
    <div className="min-w-0 flex-1">
      <SearchBar variant="home" allNames={allNames} />
    </div>

    <FunFacts />
  </div>
);

export default HomeToolbar;
