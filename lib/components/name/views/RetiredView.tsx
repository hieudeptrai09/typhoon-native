import LetterNavigation from "@/lib/components/common/LetterNavigation";
import SlashToggleButton from "@/lib/components/common/SlashToggleButton";
import RetiredFilterModal from "@/lib/components/name/modals/RetiredFilterModal";
import RetiredNameDetailsModal from "@/lib/components/name/modals/RetiredNameDetailsModal";
import RetiredNamesTable from "@/lib/components/name/tables/RetiredNamesTable";
import { defaultRetiredName } from "@/lib/constants";
import type {
  RetiredFilterParams,
  RetiredName,
  RetirementReason,
  SuggestionWithNameId,
} from "@/lib/types";
import { writeDisplayPrefs, type NamesDisplayPrefs } from "@/lib/utils/name/displayPrefs";
import { toArr } from "@/lib/utils/params";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RetiredViewProps {
  retiredNames: RetiredName[];
  suggestedNames: SuggestionWithNameId[];
  displayPrefs: NamesDisplayPrefs;
}

interface RetiredFilterValues {
  name: string;
  year: string;
  country: string[];
  reason: RetirementReason[];
  position: string;
}

const EMPTY_FILTERS: RetiredFilterParams = {
  name: "",
  year: "",
  country: "",
  reason: "",
  position: "",
  letter: "",
};

const applyRetiredFilters = (names: RetiredName[], filters: RetiredFilterValues): RetiredName[] => {
  let filtered = [...names];

  if (filters.name) {
    filtered = filtered.filter((n) => n.name.toLowerCase().includes(filters.name.toLowerCase()));
  }
  if (filters.year) {
    filtered = filtered.filter((n) => n.lastYear === Number(filters.year));
  }
  if (filters.country.length > 0) {
    filtered = filtered.filter((n) => filters.country.includes(n.country));
  }
  if (filters.reason.length > 0) {
    filtered = filtered.filter(
      (n) => n.retirementReason && filters.reason.includes(n.retirementReason),
    );
  }
  if (filters.position) {
    filtered = filtered.filter((n) => n.position === Number(filters.position));
  }

  return filtered;
};

const getFirstAvailableLetter = (availableLettersMap: Record<string, boolean>) => {
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return allLetters.find((letter) => availableLettersMap[letter]) ?? "A";
};

// Filters and the active letter were query params on web so the page could be linked; on native
// they are plain state, and changing a letter no longer pushes a history entry.
const RetiredView = ({ retiredNames, suggestedNames, displayPrefs }: RetiredViewProps) => {
  const [filters, setFilters] = useState<RetiredFilterParams>(EMPTY_FILTERS);
  const [letter, setLetter] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NamesDisplayPrefs>(displayPrefs);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedRetiredName, setSelectedRetiredName] = useState<RetiredName>(defaultRetiredName);
  const [isRetiredNameModalOpen, setIsRetiredNameModalOpen] = useState(false);

  const suggestionsByNameId = useMemo(
    () =>
      suggestedNames.reduce<Record<number, SuggestionWithNameId[]>>((acc, suggestion) => {
        if (!acc[suggestion.nameId]) acc[suggestion.nameId] = [];
        acc[suggestion.nameId].push(suggestion);
        return acc;
      }, {}),
    [suggestedNames],
  );

  const suggestions = suggestionsByNameId[selectedRetiredName.id] ?? [];

  const countries = useMemo(
    () => [...new Set(retiredNames.map((n) => n.country))].sort(),
    [retiredNames],
  );

  const activeFilterCount = [
    filters.name,
    filters.year,
    filters.country,
    filters.reason,
    filters.position,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const availableLettersMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    retiredNames.forEach((n) => {
      map[n.name.charAt(0).toUpperCase()] = true;
    });
    return map;
  }, [retiredNames]);

  const currentLetter = letter ?? getFirstAvailableLetter(availableLettersMap);
  const showLetterNav = !hasActiveFilters && prefs.showLetterNav;

  const displayedNames = useMemo(() => {
    const filtered = applyRetiredFilters(retiredNames, {
      name: filters.name,
      year: filters.year,
      country: toArr(filters.country),
      reason: toArr(filters.reason) as RetirementReason[],
      position: filters.position,
    });

    if (showLetterNav) {
      return filtered.filter((n) => n.name.charAt(0).toUpperCase() === currentLetter);
    }

    return filtered;
  }, [retiredNames, filters, currentLetter, showLetterNav]);

  const countMatchingNames = useCallback(
    (pending: RetiredFilterParams) =>
      applyRetiredFilters(retiredNames, {
        name: pending.name,
        year: pending.year,
        country: toArr(pending.country),
        reason: toArr(pending.reason) as RetirementReason[],
        position: pending.position,
      }).length,
    [retiredNames],
  );

  const handleToggleLetterNav = () => {
    const next: NamesDisplayPrefs = { ...prefs, showLetterNav: !showLetterNav };
    setPrefs(next);
    writeDisplayPrefs(next);
    // Letter nav and filters narrow the same list, so turning the nav on drops the filters.
    if (next.showLetterNav && hasActiveFilters) setFilters(EMPTY_FILTERS);
  };

  const getLetterConfig = (target: string) => {
    const isAvailable = Boolean(availableLettersMap[target]);
    const isActive = currentLetter === target;
    return {
      isAvailable,
      color: !isAvailable ? "#cbd5e1" : isActive ? "#991b1b" : "#dc2626",
      isActive: isAvailable && isActive,
    };
  };

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <SlashToggleButton
          active={showLetterNav}
          onPress={handleToggleLetterNav}
          label={showLetterNav ? "Letter navigation is on" : "Letter navigation is off"}
        >
          <Ionicons name="text-outline" size={24} color="#334155" />
        </SlashToggleButton>

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
          <Ionicons name="funnel-outline" size={24} color="#334155" />
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

      <RetiredNamesTable
        paginatedData={displayedNames}
        onNameClick={(name) => {
          setSelectedRetiredName(name);
          setIsRetiredNameModalOpen(true);
        }}
      />

      <RetiredFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(applied) => {
          setIsFilterModalOpen(false);
          setFilters(applied);
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
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 8,
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
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 10,
    color: "#ffffff",
  },
  letters: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});

export default RetiredView;
