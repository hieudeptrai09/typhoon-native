import HistoryModal from "@/lib/components/name/modals/HistoryModal";
import ListFilterModal from "@/lib/components/name/modals/ListFilterModal";
import NameDetailsModal from "@/lib/components/name/modals/NameDetailsModal";
import { LAYOUT_OPTIONS, type NamesLayout } from "@/lib/components/name/options";
import FilteredNamesTable from "@/lib/components/name/tables/FilteredNamesTable";
import NameOptionsSheet from "@/lib/components/name/widgets/NameOptionsSheet";
import NamesToolbar from "@/lib/components/name/widgets/NamesToolbar";
import PositionNameGrid from "@/lib/components/name/widgets/PositionNameGrid";
import { defaultTyphoonName } from "@/lib/constants";
import type { FilterParams, StormHistoryEntry, TyphoonName } from "@/lib/types";
import { applyNameFilters, clearNameFilter, nameFilterChips } from "@/lib/utils/name/filters";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

interface NamesViewProps {
  allNames: TyphoonName[];
  stormHistory: StormHistoryEntry[];
  layout: NamesLayout;
  showName: boolean;
  showHistory: boolean;
  filters: FilterParams;
  onLayoutChange: (layout: NamesLayout) => void;
  onShowNameChange: (showName: boolean) => void;
  onFiltersChange: (filters: FilterParams) => void;
}

const NamesView = ({
  allNames,
  stormHistory,
  layout,
  showName,
  showHistory,
  filters,
  onLayoutChange,
  onShowNameChange,
  onFiltersChange,
}: NamesViewProps) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<TyphoonName>(defaultTyphoonName);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [historyPosition, setHistoryPosition] = useState<number>(0);
  const [historyPositionNames, setHistoryPositionNames] = useState<TyphoonName[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // A misspelling is a correction to a name, not a name the committee ever assigned, so it stays
  // out of the rotation.
  const rotationNames = useMemo(
    () => allNames.filter((name) => name.retirementReason !== "misspell"),
    [allNames],
  );

  // Outside the history scope there is no status to choose: the point of "Current" is the rotation
  // as it stands.
  const effectiveFilters = useMemo(
    () => (showHistory ? filters : { ...filters, status: "current" }),
    [filters, showHistory],
  );

  const stormsByPosition = useMemo(
    () =>
      stormHistory.reduce<Record<number, StormHistoryEntry[]>>((acc, storm) => {
        (acc[storm.position] ??= []).push(storm);
        return acc;
      }, {}),
    [stormHistory],
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

  const chips = useMemo(() => nameFilterChips(filters, showHistory), [filters, showHistory]);

  const filteredNames = useMemo(
    () => applyNameFilters(rotationNames, effectiveFilters),
    [rotationNames, effectiveFilters],
  );

  // Reuse-count colouring is the full-overview visualization: it only says something while the
  // grid still holds every name at a position.
  const colorfulHistory = showHistory && chips.length === 0;

  // Counted through the same effective status the view will render with, or the modal promises
  // matches the list then drops.
  const countMatchingNames = useCallback(
    (pending: FilterParams) =>
      applyNameFilters(rotationNames, showHistory ? pending : { ...pending, status: "current" })
        .length,
    [rotationNames, showHistory],
  );

  const handleNamePress = (name: TyphoonName) => {
    setSelectedName(name);
    setIsNameModalOpen(true);
  };

  const handleCellPress = (position: number, names: TyphoonName[]) => {
    if (showHistory) {
      setHistoryPosition(position);
      setHistoryPositionNames(names);
      setIsHistoryModalOpen(true);
      return;
    }
    if (names.length > 0) handleNamePress(names[0]);
  };

  const layoutOption = LAYOUT_OPTIONS.find((option) => option.value === layout);
  const layoutLabel =
    layout === "grid"
      ? `${layoutOption?.label} · ${showName ? "Names" : "Categories"}`
      : (layoutOption?.label ?? layout);

  return (
    <View style={styles.root}>
      <NamesToolbar
        options={{
          label: layoutLabel,
          icon: layoutOption?.icon ?? "grid-outline",
          onPress: () => setIsOptionsOpen(true),
        }}
        chips={chips}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        onRemoveChip={(key) => onFiltersChange(clearNameFilter(filters, key))}
      />

      {layout === "grid" ? (
        <PositionNameGrid
          names={filteredNames}
          showName={showName}
          showHistory={showHistory}
          colorfulHistory={colorfulHistory}
          onCellPress={handleCellPress}
        />
      ) : (
        <FilteredNamesTable filteredNames={filteredNames} onNamePress={handleNamePress} />
      )}

      <NameOptionsSheet
        open={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        layout={layout}
        onLayoutChange={onLayoutChange}
        showName={showName}
        onShowNameChange={onShowNameChange}
      />

      <ListFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(applied) => {
          setIsFilterModalOpen(false);
          onFiltersChange(applied);
        }}
        countries={countries}
        languages={languages}
        tags={tags}
        showHistory={showHistory}
        matchCount={countMatchingNames}
        initialFilters={effectiveFilters}
      />

      <NameDetailsModal
        isOpen={isNameModalOpen}
        name={selectedName}
        hideReplacedBy
        onClose={() => setIsNameModalOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        position={historyPosition}
        positionNames={historyPositionNames}
        storms={stormsByPosition[historyPosition] ?? []}
        onClose={() => setIsHistoryModalOpen(false)}
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
