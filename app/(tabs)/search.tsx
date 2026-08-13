import { useApiQuery } from "@/lib/api/client";
import FrownError from "@/lib/components/common/FrownError";
import SearchField from "@/lib/components/search/SearchField";
import SearchPageContent from "@/lib/components/search/SearchPageContent";
import type { SearchResult } from "@/lib/types";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const DEBOUNCE_MS = 350;

function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// The web page read the query from ?q= because the navbar search box navigated here. A tab has no
// navbar to arrive from, so the field lives on the screen and results follow the typing.
export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const debounced = useDebounced(trimmed, DEBOUNCE_MS);

  const results = useApiQuery<SearchResult[]>(
    debounced ? `/api/v1/search?q=${encodeURIComponent(debounced)}` : null,
  );

  // Held separately so the list does not blink back to the empty state between keystrokes: the
  // previous results stay on screen while the next request is in flight.
  const [shown, setShown] = useState<SearchResult[]>([]);
  useEffect(() => {
    if (!debounced) {
      setShown([]);
      return;
    }
    if (results.data !== null) setShown(results.data);
  }, [debounced, results.data]);

  const missed = Boolean(debounced) && !results.isLoading && shown.length === 0;
  const similar = useApiQuery<string[]>(
    missed ? `/api/v1/similar-names?name=${encodeURIComponent(debounced)}` : null,
  );

  return (
    <View style={styles.root}>
      <SearchField value={query} onChangeText={setQuery} isLoading={results.isLoading} />

      {results.isError ? (
        <FrownError onRetry={results.refetch} />
      ) : (
        <SearchPageContent results={shown} query={trimmed} similarNames={similar.data ?? []} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
