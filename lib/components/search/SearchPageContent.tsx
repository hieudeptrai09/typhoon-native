import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import HighlightedName from "@/lib/components/common/HighlightedName";
import NameStatusIcon from "@/lib/components/name/NameStatusIcon";
import DidYouMean from "@/lib/components/search/DidYouMean";
import { COLOR } from "@/lib/constants/theme";
import type { SearchResult } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import type { SortField } from "@/lib/utils/table";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

const sortFields: SortField<SearchResult>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  { key: "status", label: "Status", compare: (a, b) => Number(a.isRetired) - Number(b.isRetired) },
  { key: "stormCount", label: "Storms", compare: (a, b) => a.stormCount - b.stormCount },
];

interface SearchPageContentProps {
  results: SearchResult[];
  query: string;
  similarNames?: string[];
}

export default function SearchPageContent({
  results,
  query,
  similarNames = [],
}: SearchPageContentProps) {
  const router = useRouter();

  if (!query.trim()) {
    return (
      <View style={styles.state}>
        <EmptyResults icon="search-outline" description="Type a name to search" />
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.state}>
        <EmptyResults
          icon="search-outline"
          description={`No typhoon names match "${query}". Check the spelling or try a shorter name.`}
          action={<DidYouMean names={similarNames} />}
        />
      </View>
    );
  }

  return (
    <DataList<SearchResult>
      data={results}
      keyExtractor={(record) => (record.id !== null ? String(record.id) : `storm-${record.name}`)}
      sortFields={sortFields}
      countLabel={(total) => `${total} result${total === 1 ? "" : "s"} found`}
      onRowPress={(record) => router.push(`/info/${encodeURIComponent(record.name.toLowerCase())}`)}
      renderCard={(record, index) => (
        <DataCard
          ordinal={index + 1}
          title={<HighlightedName name={record.name} query={query} style={styles.name} />}
          trailing={
            <NameStatusIcon
              isRetired={record.isRetired}
              retirementReason={record.retirementReason ?? undefined}
              position={record.position}
              size={20}
            />
          }
          fields={[
            { label: "Storms", value: `×${record.stormCount}` },
            { label: "Position", value: getPositionTitle(record.position) },
            {
              label: "Contributed by",
              value: <CountryFlag country={record.country} size={16} showName />,
              wide: true,
            },
            ...(record.replacementName
              ? [{ label: "Replacement", value: record.replacementName }]
              : []),
            ...(record.note ? [{ label: "Note", value: record.note, wide: true }] : []),
          ]}
          pressable
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 16,
    color: COLOR.accent,
  },
});
