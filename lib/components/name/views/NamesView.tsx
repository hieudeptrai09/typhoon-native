import LetterNavigation from "@/lib/components/common/LetterNavigation";
import SegmentedControl from "@/lib/components/common/SegmentedControl";
import SlashToggleButton from "@/lib/components/common/SlashToggleButton";
import HistoryModal from "@/lib/components/name/modals/HistoryModal";
import ListFilterModal from "@/lib/components/name/modals/ListFilterModal";
import NameDetailsModal from "@/lib/components/name/modals/NameDetailsModal";
import FilteredNamesTable from "@/lib/components/name/tables/FilteredNamesTable";
import PositionNameGrid from "@/lib/components/name/widgets/PositionNameGrid";
import { defaultTyphoonName } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { FilterParams, StormHistoryEntry, TyphoonName } from "@/lib/types";
import { writeDisplayPrefs, type NamesDisplayPrefs } from "@/lib/utils/name/displayPrefs";
import { toArr } from "@/lib/utils/params";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const LAYOUT_OPTIONS = [
  { value: "grid", label: "Grid", icon: "grid-outline" as const },
  { value: "list", label: "List", icon: "list-outline" as const },
];

const EMPTY_FILTERS: FilterParams = {
  name: "",
  country: "",
  language: "",
  tag: "",
  position: "",
  status: "",
  letter: "",
};

interface NameFilterValues {
  name: string;
  country: string[];
  language: string[];
  tag: string[];
  position: string;
  status: string;
}

interface NamesViewProps {
  allNames: TyphoonName[];
  stormHistory: StormHistoryEntry[];
  viewMode: "grid" | "list";
  showName: boolean;
  showHistory: boolean;
  displayPrefs: NamesDisplayPrefs;
  onLayoutChange: (layout: "grid" | "list") => void;
  onShowNameChange: (showName: boolean) => void;
}

const applyNameFilters = (names: TyphoonName[], filters: NameFilterValues): TyphoonName[] => {
  let filtered = [...names];

  if (filters.name) {
    filtered = filtered.filter((n) => n.name.toLowerCase().includes(filters.name.toLowerCase()));
  }
  if (filters.country.length > 0) {
    filtered = filtered.filter((n) => filters.country.includes(n.country));
  }
  if (filters.language.length > 0) {
    filtered = filtered.filter((n) => filters.language.includes(n.language));
  }
  if (filters.tag.length > 0) {
    filtered = filtered.filter((n) => filters.tag.includes(n.tag));
  }
  if (filters.position) {
    filtered = filtered.filter((n) => n.position === Number(filters.position));
  }
  if (filters.status === "active") {
    filtered = filtered.filter((n) => !n.isRetired);
  } else if (filters.status === "retired") {
    filtered = filtered.filter((n) => n.isRetired);
  } else if (filters.status === "current") {
    filtered = filtered.filter((n) => !n.isRetired || !n.isReplaced);
  }

  return filtered;
};

const categorizeLettersByStatus = (
  namesList: TyphoonName[],
): Record<string, [boolean, boolean, boolean]> => {
  const letterStatusMap: Record<string, [boolean, boolean, boolean]> = {};

  namesList.forEach((name) => {
    const letter = name.name.charAt(0).toUpperCase();

    if (!letterStatusMap[letter]) letterStatusMap[letter] = [false, false, false];

    letterStatusMap[letter][0] = true;
    if (name.isRetired) letterStatusMap[letter][1] = true;
    else letterStatusMap[letter][2] = true;
  });

  return letterStatusMap;
};

const getFirstAvailableLetter = (letterStatusMap: Record<string, [boolean, boolean, boolean]>) => {
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return allLetters.find((letter) => letterStatusMap[letter]?.[0]) ?? "A";
};

// The web build kept filters and the active letter in the query string so each combination was
// linkable. A tab has no address bar, so they are state here — and the letter no longer needs a
// navigation to change.
const NamesView = ({
  allNames,
  stormHistory,
  viewMode,
  showName,
  showHistory,
  displayPrefs,
  onLayoutChange,
  onShowNameChange,
}: NamesViewProps) => {
  const displayMode = viewMode === "list" ? ("list" as const) : ("grid" as const);

  const [filters, setFilters] = useState<FilterParams>(EMPTY_FILTERS);
  const [letter, setLetter] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NamesDisplayPrefs>(displayPrefs);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<TyphoonName>(defaultTyphoonName);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [historyPosition, setHistoryPosition] = useState<number>(0);
  const [historyPositionNames, setHistoryPositionNames] = useState<TyphoonName[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const selectedStatus = showHistory ? filters.status : "current";

  const stormsByPosition = useMemo(
    () =>
      stormHistory.reduce<Record<number, StormHistoryEntry[]>>((acc, storm) => {
        if (!acc[storm.position]) acc[storm.position] = [];
        acc[storm.position].push(storm);
        return acc;
      }, {}),
    [stormHistory],
  );

  const countries = useMemo(() => [...new Set(allNames.map((n) => n.country))].sort(), [allNames]);
  const languages = useMemo(
    () => [...new Set(allNames.map((n) => n.language).filter(Boolean))].sort(),
    [allNames],
  );
  const tags = useMemo(
    () => [...new Set(allNames.map((n) => n.tag).filter(Boolean) as string[])].sort(),
    [allNames],
  );

  const activeFilterCount = [
    filters.name,
    filters.country,
    filters.language,
    filters.position,
    filters.tag,
    showHistory ? filters.status : "",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const filterValues = useMemo(
    () => ({
      name: filters.name,
      country: toArr(filters.country),
      language: toArr(filters.language),
      tag: toArr(filters.tag),
      position: filters.position,
      status: selectedStatus,
    }),
    [filters, selectedStatus],
  );

  const statusFilteredNames = useMemo(
    () =>
      selectedStatus
        ? applyNameFilters(allNames, {
            name: "",
            country: [],
            language: [],
            tag: [],
            position: "",
            status: selectedStatus,
          })
        : allNames,
    [allNames, selectedStatus],
  );

  const letterStatusMap = useMemo(
    () => categorizeLettersByStatus(statusFilteredNames),
    [statusFilteredNames],
  );
  const currentLetter = letter ?? getFirstAvailableLetter(letterStatusMap);

  const filteredAllNames = useMemo(() => {
    if (hasActiveFilters) return applyNameFilters(statusFilteredNames, filterValues);
    if (!prefs.showLetterNav) return statusFilteredNames;
    return statusFilteredNames.filter((n) => n.name.charAt(0).toUpperCase() === currentLetter);
  }, [statusFilteredNames, hasActiveFilters, filterValues, prefs.showLetterNav, currentLetter]);

  const showLetterNav = !hasActiveFilters && prefs.showLetterNav;
  // Reuse-count coloring is the full-overview visualization: it applies automatically on the
  // history grid whenever the view isn't narrowed by letter nav or filters.
  const colorfulHistory = showHistory && !hasActiveFilters && !prefs.showLetterNav;

  const countMatchingNames = useCallback(
    (pending: FilterParams) =>
      applyNameFilters(allNames, {
        name: pending.name,
        country: toArr(pending.country),
        language: toArr(pending.language),
        tag: toArr(pending.tag),
        position: pending.position,
        status: pending.status,
      }).length,
    [allNames],
  );

  const handleApplyFilters = (applied: FilterParams) => {
    setIsFilterModalOpen(false);
    setFilters(applied);
  };

  const handleToggleLetterNav = () => {
    const next: NamesDisplayPrefs = { ...prefs, showLetterNav: !showLetterNav };
    setPrefs(next);
    writeDisplayPrefs(next);
    // Letter nav and filters narrow the same list, so turning the nav on drops the filters
    // rather than stacking two competing narrowings.
    if (next.showLetterNav && hasActiveFilters) setFilters(EMPTY_FILTERS);
  };

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

  const getLetterConfig = (target: string) => {
    const status = letterStatusMap[target];
    const isActive = currentLetter === target;

    if (!status?.[0]) return { isAvailable: false, color: COLOR.disabled };

    const hasRetired = status[1];
    const hasAlive = status[2];

    if (hasRetired && hasAlive) return { isAvailable: true, color: COLOR.accent, isActive };
    if (hasRetired) return { isAvailable: true, color: COLOR.danger, isActive };
    return { isAvailable: true, color: COLOR.success, isActive };
  };

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <View style={styles.layout}>
          <SegmentedControl
            options={LAYOUT_OPTIONS}
            value={displayMode}
            onChange={(mode) => onLayoutChange(mode as "grid" | "list")}
            accessibilityLabel="Switch between grid and list layout"
          />
        </View>

        <SlashToggleButton
          active={showLetterNav}
          onPress={handleToggleLetterNav}
          label={showLetterNav ? "Letter navigation is on" : "Letter navigation is off"}
        >
          <Ionicons name="text-outline" size={24} color={COLOR.textSecondary} />
        </SlashToggleButton>

        {displayMode === "grid" && (
          <SlashToggleButton
            active={!showName}
            onPress={() => onShowNameChange(!showName)}
            label={!showName ? "Category icons are on" : "Category icons are off"}
          >
            <Ionicons name="pricetag-outline" size={24} color={COLOR.textSecondary} />
          </SlashToggleButton>
        )}

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setIsFilterModalOpen(true);
          }}
          hitSlop={8}
          style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
        >
          <Ionicons name="funnel-outline" size={24} color={COLOR.textSecondary} />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {showLetterNav && (
        <View style={styles.letters}>
          <LetterNavigation onLetterChange={setLetter} getLetterConfig={getLetterConfig} />
        </View>
      )}

      {displayMode === "grid" ? (
        <PositionNameGrid
          names={filteredAllNames}
          showName={showName}
          showHistory={showHistory}
          colorfulHistory={colorfulHistory}
          onNameClick={handleNamePress}
          onCellClick={handleCellPress}
        />
      ) : (
        <FilteredNamesTable filteredNames={filteredAllNames} onNameClick={handleNamePress} />
      )}

      <ListFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        countries={countries}
        languages={languages}
        tags={tags}
        showHistory={showHistory}
        matchCount={countMatchingNames}
        initialFilters={{ ...filters, status: selectedStatus }}
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
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingBottom: SPACE.sm,
  },
  layout: {
    flex: 1,
  },
  filterButton: {
    padding: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLOR.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 10,
    color: COLOR.textInverse,
  },
  letters: {
    paddingHorizontal: SPACE.lg,
    paddingBottom: SPACE.sm,
  },
});

export default NamesView;
