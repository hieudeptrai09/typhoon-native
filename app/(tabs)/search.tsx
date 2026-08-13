import { useApiQuery } from "@/lib/api/client";
import FrownError from "@/lib/components/common/FrownError";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import SearchField from "@/lib/components/search/SearchField";
import SearchPageContent from "@/lib/components/search/SearchPageContent";
import { useRecentNames } from "@/lib/components/search/useRecentNames";
import type { SearchResult } from "@/lib/types";
import { topSuggestions } from "@/lib/utils/fuzzy";
import { rankMatches } from "@/lib/utils/search";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";

/**
 * The web page read the query from ?q= because the navbar search box navigated here. A tab has no
 * navbar to arrive from, so the field lives on the screen.
 *
 * The catalogue is fetched once and matched on-device, which is what makes the screen feel native:
 * results move with the keystroke, with no debounce to sit through, no spinner, and no dependence
 * on the connection once the tab has been opened.
 */
export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const index = useApiQuery<SearchResult[]>("/api/v1/search-index");
  const catalogue = index.data;
  const recent = useRecentNames();

  const results = useMemo(
    () => (catalogue ? rankMatches(catalogue, trimmed, (row) => row.name) : []),
    [catalogue, trimmed],
  );

  // Only worth computing for a query that found nothing, and cheap enough over a few hundred names
  // that it no longer needs the round trip the web build made for it.
  const suggestions = useMemo(() => {
    if (!catalogue || trimmed === "" || results.length > 0) return [];
    return topSuggestions(
      trimmed,
      catalogue.map((row) => row.name),
    );
  }, [catalogue, trimmed, results.length]);

  if (index.isLoading) return <ScreenLoading />;
  if (!catalogue) return <FrownError onRetry={index.refetch} />;

  const open = (name: string) => {
    recent.remember(name);
    Keyboard.dismiss();
    router.push(`/info/${encodeURIComponent(name.toLowerCase())}`);
  };

  return (
    <RefreshProvider value={{ refreshing: index.isRefetching, onRefresh: index.refetch }}>
      <View style={styles.root}>
        <SearchField value={query} onChangeText={setQuery} />

        <SearchPageContent
          query={trimmed}
          results={results}
          suggestions={suggestions}
          recent={recent.names}
          onOpen={open}
          onClearRecent={recent.clear}
        />
      </View>
    </RefreshProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
