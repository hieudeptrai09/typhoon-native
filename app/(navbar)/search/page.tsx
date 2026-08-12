import { getSimilarNames } from "@/lib/db/api/getSimilarNames";
import { search } from "@/lib/db/api/search";
import type { Metadata } from "next";
import SearchPageContent from "./SearchPageContent";

export const metadata: Metadata = {
  title: "Search Typhoon Names",
  description: "Search and browse typhoon names by name, position, country, and status.",
  alternates: {
    canonical: "/search/",
  },
};

const SearchPage = async ({ searchParams }: { searchParams: Promise<{ q?: string }> }) => {
  const { q = "" } = await searchParams;

  const query = q.trim();
  const result = query ? await search(query) : null;

  const isError = query !== "" && result === null;

  // ILIKE found nothing, so fall back to fuzzy matches for a "Did you mean" hint.
  // Suggestions are a nicety, so a failed name-list fetch degrades to the plain empty state.
  const similar =
    query && result?.count === 0 ? await getSimilarNames(query).catch(() => null) : null;

  return (
    <SearchPageContent
      results={result?.data ?? []}
      count={result?.count ?? 0}
      query={q}
      isError={isError}
      similarNames={similar?.data ?? []}
    />
  );
};

export default SearchPage;
