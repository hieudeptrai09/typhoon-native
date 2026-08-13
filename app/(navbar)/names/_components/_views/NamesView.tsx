import LetterNavigation from "@/lib/components/LetterNavigation";
import { defaultTyphoonName } from "@/lib/constants";
import type { FilterParams, StormHistoryEntry, TyphoonName } from "@/lib/types";
import { toArr } from "@/lib/utils/params";
import { Badge, Button, Segmented } from "antd";
import { CaseUpper, Filter, LayoutGrid, List, Tag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import HistoryModal from "../_modals/HistoryModal";
import ListFilterModal from "../_modals/ListFilterModal";
import NameDetailsModal from "../_modals/NameDetailsModal";
import FilteredNamesTable from "../_widgets/FilteredNamesTable";
import PositionNameGrid from "../_widgets/PositionNameGrid";
import SlashToggleButton from "../_widgets/SlashToggleButton";
import type { NamesDisplayPrefs } from "../../_utils/displayPrefs";
import { writeDisplayPrefs } from "../../_utils/displayPrefs";
import { paramsToPath } from "../../_utils/routing";

const LAYOUT_OPTIONS = [
  {
    label: (
      <span className="flex items-center justify-center gap-1.5">
        <LayoutGrid size={13} />
        Grid
      </span>
    ),
    value: "grid",
  },
  {
    label: (
      <span className="flex items-center justify-center gap-1.5">
        <List size={13} />
        List
      </span>
    ),
    value: "list",
  },
];

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
    const isRetired = name.isRetired;

    if (!letterStatusMap[letter]) letterStatusMap[letter] = [false, false, false];

    letterStatusMap[letter][0] = true;
    if (isRetired) letterStatusMap[letter][1] = true;
    else letterStatusMap[letter][2] = true;
  });

  return letterStatusMap;
};

const getFirstAvailableLetter = (letterStatusMap: Record<string, [boolean, boolean, boolean]>) => {
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return allLetters.find((letter) => letterStatusMap[letter]?.[0]) ?? "A";
};

const NamesView = ({
  allNames,
  stormHistory,
  viewMode,
  showName,
  showHistory,
  displayPrefs,
}: NamesViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const displayMode = viewMode === "list" ? ("list" as const) : ("grid" as const);
  const currentPath = paramsToPath(
    displayMode === "list"
      ? { view: "list", showHistory }
      : { view: "grid", showName, showHistory },
  );

  const searchName = searchParams.get("name") || "";
  const selectedCountry = searchParams.get("country") || "";
  const selectedLanguage = searchParams.get("language") || "";
  const selectedTag = searchParams.get("tag") || "";
  const searchPosition = searchParams.get("position") || "";

  const countryArr = toArr(selectedCountry);
  const languageArr = toArr(selectedLanguage);
  const tagArr = toArr(selectedTag);

  const [prefs, setPrefs] = useState<NamesDisplayPrefs>(displayPrefs);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<TyphoonName>(defaultTyphoonName);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [historyPosition, setHistoryPosition] = useState<number>(0);
  const [historyPositionNames, setHistoryPositionNames] = useState<TyphoonName[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const selectedStatus = showHistory ? searchParams.get("status") || "" : "current";

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
    searchName,
    selectedCountry,
    selectedLanguage,
    searchPosition,
    selectedTag,
    showHistory ? selectedStatus : "",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const filterValues = useMemo(
    () => ({
      name: searchName,
      country: countryArr,
      language: languageArr,
      tag: tagArr,
      position: searchPosition,
      status: selectedStatus,
    }),
    [searchName, countryArr, languageArr, tagArr, searchPosition, selectedStatus],
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
  const currentLetter = searchParams.get("letter") || getFirstAvailableLetter(letterStatusMap);

  const filteredAllNames = useMemo(() => {
    if (hasActiveFilters) return applyNameFilters(statusFilteredNames, filterValues);
    if (!prefs.showLetterNav) return statusFilteredNames;
    return statusFilteredNames.filter((n) => n.name.charAt(0).toUpperCase() === currentLetter);
  }, [statusFilteredNames, hasActiveFilters, filterValues, prefs.showLetterNav, currentLetter]);

  const showLetterNav = !hasActiveFilters && prefs.showLetterNav;
  // Reuse-count coloring is the full-overview visualization: it applies automatically on the history grid whenever the view isn't narrowed by letter nav or filters.
  const colorfulHistory = showHistory && !hasActiveFilters && !prefs.showLetterNav;

  const buildQuery = useCallback((params: Record<string, string>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    const qs = urlParams.toString();
    return qs ? `?${qs}` : "";
  }, []);

  const handleLetterChange = (letter: string) => {
    router.push(`${currentPath}${buildQuery({ letter })}`);
  };

  const countMatchingNames = useCallback(
    (filters: FilterParams) =>
      applyNameFilters(allNames, {
        name: filters.name,
        country: toArr(filters.country),
        language: toArr(filters.language),
        tag: toArr(filters.tag),
        position: filters.position,
        status: filters.status,
      }).length,
    [allNames],
  );

  const handleApplyFilters = (filters: FilterParams) => {
    setIsFilterModalOpen(false);
    const hasFilters =
      filters.name ||
      filters.country ||
      filters.language ||
      filters.position ||
      filters.tag ||
      filters.status;
    const query = buildQuery({
      name: filters.name,
      country: filters.country,
      language: filters.language,
      position: filters.position,
      tag: filters.tag,
      status: filters.status,
      ...(!hasFilters ? { letter: currentLetter } : {}),
    });
    router.push(`${currentPath}${query}`);
  };

  const handleLayoutChange = (mode: string) => {
    router.push(
      paramsToPath(
        mode === "list"
          ? { view: "list", showHistory }
          : { view: "grid", showName: true, showHistory },
      ),
    );
  };

  const handleToggleLetterNav = () => {
    const nextShowLetterNav = !showLetterNav;
    const newPrefs: NamesDisplayPrefs = { ...prefs, showLetterNav: nextShowLetterNav };
    setPrefs(newPrefs);
    writeDisplayPrefs(newPrefs);
    if (nextShowLetterNav && hasActiveFilters) {
      router.push(`${currentPath}${buildQuery({ letter: currentLetter })}`);
    }
  };

  const handleToggleTagIcons = () => {
    router.push(paramsToPath({ view: "grid", showName: !showName, showHistory }));
  };

  const handleNameClick = (name: TyphoonName) => {
    setSelectedName(name);
    setIsNameModalOpen(true);
  };

  const handleCellClick = (position: number, names: TyphoonName[]) => {
    if (showHistory) {
      setHistoryPosition(position);
      setHistoryPositionNames(names);
      setIsHistoryModalOpen(true);
    } else {
      if (names.length > 0) handleNameClick(names[0]);
    }
  };

  const getLetterConfig = (letter: string) => {
    const status = letterStatusMap[letter];
    const isActive = currentLetter === letter;

    if (!status?.[0]) return { isAvailable: false, color: "#9ca3af" };

    const hasRetired = status[1];
    const hasAlive = status[2];

    if (hasRetired && hasAlive) {
      return { isAvailable: true, color: isActive ? "#1e40af" : "#2563eb", isActive };
    } else if (hasRetired && !hasAlive) {
      return { isAvailable: true, color: isActive ? "#991b1b" : "#dc2626", isActive };
    } else {
      return { isAvailable: true, color: isActive ? "#166534" : "#16a34a", isActive };
    }
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Segmented
            options={LAYOUT_OPTIONS}
            value={displayMode}
            onChange={(v) => handleLayoutChange(String(v))}
            aria-label="Switch between grid and list layout"
          />
          <SlashToggleButton
            active={showLetterNav}
            onClick={handleToggleLetterNav}
            title={showLetterNav ? "Letter navigation is on" : "Letter navigation is off"}
          >
            <CaseUpper size={26} />
          </SlashToggleButton>
          {displayMode === "grid" && (
            <SlashToggleButton
              active={!showName}
              onClick={handleToggleTagIcons}
              title={!showName ? "Category icons are on" : "Category icons are off"}
            >
              <Tag size={26} />
            </SlashToggleButton>
          )}
          <Badge count={activeFilterCount} color="#ef4444" offset={[-4, 4]}>
            <Button
              type="text"
              onClick={() => setIsFilterModalOpen(true)}
              title="Filters"
              aria-label={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
              icon={<Filter size={30} />}
              className="h-auto! w-auto! p-1! text-foreground! hover:bg-transparent! hover:text-highlight!"
            />
          </Badge>
        </div>
      </div>

      {showLetterNav && (
        <LetterNavigation onLetterChange={handleLetterChange} getLetterConfig={getLetterConfig} />
      )}

      {displayMode === "grid" ? (
        <PositionNameGrid
          names={filteredAllNames}
          showName={showName}
          showHistory={showHistory}
          colorfulHistory={colorfulHistory}
          onNameClick={handleNameClick}
          onCellClick={handleCellClick}
        />
      ) : (
        <FilteredNamesTable filteredNames={filteredAllNames} onNameClick={handleNameClick} />
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
        initialFilters={{
          name: searchName,
          country: selectedCountry,
          language: selectedLanguage,
          position: searchPosition,
          tag: selectedTag,
          status: selectedStatus,
          letter: "",
        }}
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
    </>
  );
};

export default NamesView;
