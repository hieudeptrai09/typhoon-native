import NameFilterSheet from "@/lib/components/name/modals/NameFilterSheet";
import RetiredNamesTable from "@/lib/components/name/tables/RetiredNamesTable";
import type { RetiredFilterParams, RetiredName } from "@/lib/types";
import {
  applyRetiredFilters,
  clearRetiredFilter,
  retiredFilterChips,
} from "@/lib/utils/name/filters";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

interface RetiredViewProps {
  retiredNames: RetiredName[];
  filters: RetiredFilterParams;
  onFiltersChange: (filters: RetiredFilterParams) => void;
}

const RetiredView = ({ retiredNames, filters, onFiltersChange }: RetiredViewProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const countries = useMemo(
    () => [...new Set(retiredNames.map((n) => n.country))].sort(),
    [retiredNames],
  );

  const chips = useMemo(() => retiredFilterChips(filters), [filters]);

  const displayedNames = useMemo(
    () => applyRetiredFilters(retiredNames, filters),
    [retiredNames, filters],
  );

  const countMatchingNames = useCallback(
    (pending: RetiredFilterParams) => applyRetiredFilters(retiredNames, pending).length,
    [retiredNames],
  );

  return (
    <View style={styles.root}>
      <RetiredNamesTable
        retiredNames={displayedNames}
        onNamePress={(name) => router.push(`/info/${name.name.toLowerCase()}`)}
        filter={{
          chips,
          onOpen: () => setIsFilterOpen(true),
          onRemoveChip: (key) => onFiltersChange(clearRetiredFilter(filters, key)),
        }}
      />

      <NameFilterSheet<RetiredFilterParams>
        scope="retired"
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(applied) => {
          setIsFilterOpen(false);
          onFiltersChange(applied);
        }}
        countries={countries}
        matchCount={countMatchingNames}
        initialFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default RetiredView;
