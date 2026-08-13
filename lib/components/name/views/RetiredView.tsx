import RetiredFilterModal from "@/lib/components/name/modals/RetiredFilterModal";
import RetiredNameDetailsModal from "@/lib/components/name/modals/RetiredNameDetailsModal";
import RetiredNamesTable from "@/lib/components/name/tables/RetiredNamesTable";
import NamesToolbar from "@/lib/components/name/widgets/NamesToolbar";
import { defaultRetiredName } from "@/lib/constants";
import type { RetiredFilterParams, RetiredName, SuggestionWithNameId } from "@/lib/types";
import {
  applyRetiredFilters,
  clearRetiredFilter,
  retiredFilterChips,
} from "@/lib/utils/name/filters";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

interface RetiredViewProps {
  retiredNames: RetiredName[];
  suggestedNames: SuggestionWithNameId[];
  filters: RetiredFilterParams;
  onFiltersChange: (filters: RetiredFilterParams) => void;
}

// There is no layout to choose here — a retired name carries a reason, a year and a replacement,
// which is more than a table cell can hold — so the toolbar shows only the filter control.
const RetiredView = ({
  retiredNames,
  suggestedNames,
  filters,
  onFiltersChange,
}: RetiredViewProps) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedRetiredName, setSelectedRetiredName] = useState<RetiredName>(defaultRetiredName);
  const [isRetiredNameModalOpen, setIsRetiredNameModalOpen] = useState(false);

  const suggestionsByNameId = useMemo(
    () =>
      suggestedNames.reduce<Record<number, SuggestionWithNameId[]>>((acc, suggestion) => {
        (acc[suggestion.nameId] ??= []).push(suggestion);
        return acc;
      }, {}),
    [suggestedNames],
  );

  const suggestions = suggestionsByNameId[selectedRetiredName.id] ?? [];

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
      <NamesToolbar
        chips={chips}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        onRemoveChip={(key) => onFiltersChange(clearRetiredFilter(filters, key))}
      />

      <RetiredNamesTable
        retiredNames={displayedNames}
        onNamePress={(name) => {
          setSelectedRetiredName(name);
          setIsRetiredNameModalOpen(true);
        }}
      />

      <RetiredFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(applied) => {
          setIsFilterModalOpen(false);
          onFiltersChange(applied);
        }}
        countries={countries}
        matchCount={countMatchingNames}
        initialFilters={filters}
      />

      <RetiredNameDetailsModal
        isOpen={isRetiredNameModalOpen}
        selectedName={selectedRetiredName}
        suggestions={suggestions}
        onClose={() => setIsRetiredNameModalOpen(false)}
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
