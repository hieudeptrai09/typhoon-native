import ListControls from "@/lib/components/common/ListControls";
import NameFilterSheet from "@/lib/components/name/modals/NameFilterSheet";
import NameOptionsSheet from "@/lib/components/name/widgets/NameOptionsSheet";
import PositionNameGrid from "@/lib/components/name/widgets/PositionNameGrid";
import type { FilterParams, TyphoonName } from "@/lib/types";
import { applyNameFilters, clearNameFilter, nameFilterChips } from "@/lib/utils/name/filters";
import { getPositionSlug } from "@/lib/utils/position";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

interface NamesViewProps {
  allNames: TyphoonName[];
  showHistory: boolean;
  showName: boolean;
  filters: FilterParams;
  onShowHistoryChange: (showHistory: boolean) => void;
  onShowNameChange: (showName: boolean) => void;
  onFiltersChange: (filters: FilterParams) => void;
}

const NamesView = ({
  allNames,
  showHistory,
  showName,
  filters,
  onShowHistoryChange,
  onShowNameChange,
  onFiltersChange,
}: NamesViewProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // A misspelling is a correction to a name, not a name the committee ever assigned, so it stays
  // out of the rotation.
  const rotationNames = useMemo(
    () => allNames.filter((name) => name.retirementReason !== "misspell"),
    [allNames],
  );

  // Showing the current rotation means exactly that; history lifts the constraint rather than
  // offering a status filter, so there is only one route to a retired name.
  const effectiveFilters = useMemo(
    () => (showHistory ? filters : { ...filters, status: "current" }),
    [filters, showHistory],
  );

  const countries = useMemo(
    () => [...new Set(rotationNames.map((n) => n.country))].sort(),
    [rotationNames],
  );
  const languages = useMemo(
    () => [...new Set(rotationNames.map((n) => n.language).filter(Boolean))].sort(),
    [rotationNames],
  );
  const tags = useMemo(
    () => [...new Set(rotationNames.map((n) => n.tag).filter(Boolean))].sort(),
    [rotationNames],
  );

  const chips = useMemo(() => nameFilterChips(filters), [filters]);

  const filteredNames = useMemo(
    () => applyNameFilters(rotationNames, effectiveFilters),
    [rotationNames, effectiveFilters],
  );

  // Counted through the same effective status the view will render with, or the sheet promises
  // matches the grid then drops.
  const countMatchingNames = useCallback(
    (pending: FilterParams) =>
      applyNameFilters(rotationNames, showHistory ? pending : { ...pending, status: "current" })
        .length,
    [rotationNames, showHistory],
  );

  // A cell in the current rotation holds the one name on screen; in history it holds a slot's
  // whole succession, which is what the position page is.
  const handleCellPress = (position: number, names: TyphoonName[]) => {
    if (showHistory) {
      router.push(`/positions/${getPositionSlug(position)}`);
      return;
    }
    if (names.length > 0) router.push(`/info/${names[0].name.toLowerCase()}`);
  };

  return (
    <View style={styles.root}>
      <ListControls
        options={{
          label: `${showHistory ? "Every name ever" : "Current rotation"} · ${showName ? "Names" : "Categories"}`,
          icon: showHistory ? "time-outline" : "flame-outline",
          onPress: () => setIsOptionsOpen(true),
        }}
        filter={{ count: chips.length, onPress: () => setIsFilterOpen(true) }}
        chips={chips.map((chip) => ({
          key: chip.key,
          label: chip.label,
          icon: "close",
          accessibilityLabel: `${chip.label} filter. Tap to remove.`,
          onPress: () => onFiltersChange(clearNameFilter(filters, chip.key)),
        }))}
      />

      <PositionNameGrid
        names={filteredNames}
        showName={showName}
        showHistory={showHistory}
        onCellPress={handleCellPress}
      />

      <NameOptionsSheet
        open={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        showHistory={showHistory}
        onShowHistoryChange={onShowHistoryChange}
        showName={showName}
        onShowNameChange={onShowNameChange}
      />

      <NameFilterSheet<FilterParams>
        scope="names"
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(applied) => {
          setIsFilterOpen(false);
          onFiltersChange(applied);
        }}
        countries={countries}
        languages={languages}
        tags={tags}
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

export default NamesView;
