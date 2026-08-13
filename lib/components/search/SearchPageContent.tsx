import DataList from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import DidYouMean from "@/lib/components/search/DidYouMean";
import RecentSearches from "@/lib/components/search/RecentSearches";
import SearchResultRow from "@/lib/components/search/SearchResultRow";
import { COLOR } from "@/lib/constants/theme";
import type { SearchResult } from "@/lib/types";
import type { Ranked } from "@/lib/utils/search";
import { ScrollView, StyleSheet, Text } from "react-native";

interface SearchPageContentProps {
  query: string;
  results: Ranked<SearchResult>[];
  suggestions: string[];
  recent: string[];
  onOpen: (name: string) => void;
  onClearRecent: () => void;
}

export default function SearchPageContent({
  query,
  results,
  suggestions,
  recent,
  onOpen,
  onClearRecent,
}: SearchPageContentProps) {
  if (query === "") {
    return <RecentSearches names={recent} onOpen={onOpen} onClear={onClearRecent} />;
  }

  if (results.length === 0) {
    return (
      // A scroller rather than a centred flex box: the keyboard is up whenever this state is
      // reached, and anything vertically centred ends up behind it.
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <EmptyResults
          icon="search-outline"
          description={`No typhoon names match "${query}". Check the spelling or try a shorter name.`}
          action={<DidYouMean names={suggestions} />}
        />
      </ScrollView>
    );
  }

  // No sort controls on purpose: the list is already ordered by how well each name matches, and a
  // toolbar offering to re-sort it alphabetically would only undo that.
  return (
    <DataList<Ranked<SearchResult>>
      data={results}
      keyExtractor={({ item }) => (item.id !== null ? `name-${item.id}` : `storm-${item.name}`)}
      onRowPress={({ item }) => onOpen(item.name)}
      header={
        <Text style={styles.count}>
          {results.length} result{results.length === 1 ? "" : "s"}
        </Text>
      }
      renderCard={({ item, at }) => (
        <SearchResultRow result={item} matchAt={at} matchLength={query.length} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  count: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    color: COLOR.textMuted,
  },
});
