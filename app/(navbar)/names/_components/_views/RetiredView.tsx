import LetterNavigation from "@/lib/components/LetterNavigation";
import { defaultRetiredName } from "@/lib/constants";
import type {
  RetiredFilterParams,
  RetiredName,
  RetirementReason,
  SuggestionWithNameId,
} from "@/lib/types";
import { toArr } from "@/lib/utils/params";
import { Badge, Button } from "antd";
import { CaseUpper, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import RetiredFilterModal from "../_modals/RetiredFilterModal";
import RetiredNameDetailsModal from "../_modals/RetiredNameDetailsModal";
import RetiredNamesTable from "../_widgets/RetiredNamesTable";
import SlashToggleButton from "../_widgets/SlashToggleButton";
import type { NamesDisplayPrefs } from "../../_utils/displayPrefs";
import { writeDisplayPrefs } from "../../_utils/displayPrefs";
import { paramsToPath } from "../../_utils/routing";

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

const RetiredView = ({ retiredNames, suggestedNames, displayPrefs }: RetiredViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchName = searchParams.get("name") || "";
  const selectedYear = searchParams.get("year") || "";
  const selectedCountry = searchParams.get("country") || "";
  const selectedReason = searchParams.get("reason") || "";
  const searchPosition = searchParams.get("position") || "";

  const countryArr = toArr(selectedCountry);
  const reasonArr = toArr(selectedReason) as RetirementReason[];

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
    searchName,
    selectedYear,
    selectedCountry,
    selectedReason,
    searchPosition,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const availableLettersMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    retiredNames.forEach((n) => {
      map[n.name.charAt(0).toUpperCase()] = true;
    });
    return map;
  }, [retiredNames]);

  const currentLetter = searchParams.get("letter") || getFirstAvailableLetter(availableLettersMap);

  const showLetterNav = !hasActiveFilters && prefs.showLetterNav;

  const displayedNames = useMemo(() => {
    const filtered = applyRetiredFilters(retiredNames, {
      name: searchName,
      year: selectedYear,
      country: countryArr,
      reason: reasonArr,
      position: searchPosition,
    });

    if (showLetterNav) {
      return filtered.filter((n) => n.name.charAt(0).toUpperCase() === currentLetter);
    }

    return filtered;
  }, [
    retiredNames,
    searchName,
    selectedYear,
    countryArr,
    reasonArr,
    searchPosition,
    currentLetter,
    showLetterNav,
  ]);

  const buildQuery = useCallback((params: Record<string, string>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    const qs = urlParams.toString();
    return qs ? `?${qs}` : "";
  }, []);

  const handleNameClick = (name: RetiredName) => {
    setSelectedRetiredName(name);
    setIsRetiredNameModalOpen(true);
  };

  const countMatchingNames = useCallback(
    (filters: RetiredFilterParams) =>
      applyRetiredFilters(retiredNames, {
        name: filters.name,
        year: filters.year,
        country: toArr(filters.country),
        reason: toArr(filters.reason) as RetirementReason[],
        position: filters.position,
      }).length,
    [retiredNames],
  );

  const handleApplyFilters = (filters: RetiredFilterParams) => {
    setIsFilterModalOpen(false);
    const hasFilters =
      filters.name || filters.year || filters.country || filters.reason || filters.position;
    const query = buildQuery({
      name: filters.name,
      year: filters.year,
      country: filters.country,
      reason: filters.reason,
      position: filters.position,
      ...(!hasFilters ? { letter: currentLetter } : {}),
    });
    router.push(`${paramsToPath({ view: "retired" })}${query}`);
  };

  const handleLetterChange = (letter: string) => {
    router.push(`${paramsToPath({ view: "retired" })}${buildQuery({ letter })}`);
  };

  const handleToggleLetterNav = () => {
    const nextShowLetterNav = !showLetterNav;
    const newPrefs: NamesDisplayPrefs = { ...prefs, showLetterNav: nextShowLetterNav };
    setPrefs(newPrefs);
    writeDisplayPrefs(newPrefs);
    if (nextShowLetterNav && hasActiveFilters) {
      router.push(`${paramsToPath({ view: "retired" })}${buildQuery({ letter: currentLetter })}`);
    }
  };

  const getLetterConfig = (letter: string) => {
    const isAvailable = availableLettersMap[letter];
    const isActive = currentLetter === letter;
    return {
      isAvailable,
      color: !isAvailable ? "#9ca3af" : isActive ? "#991b1b" : "#dc2626",
      isActive: !!isAvailable && isActive,
    };
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-4xl">
        <div className="flex items-center justify-center gap-6">
          <SlashToggleButton
            active={showLetterNav}
            onClick={handleToggleLetterNav}
            title={showLetterNav ? "Letter navigation is on" : "Letter navigation is off"}
          >
            <CaseUpper size={26} />
          </SlashToggleButton>
          <Badge count={activeFilterCount} color="#3b82f6" offset={[-4, 4]}>
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

      <div className="mx-auto max-w-5xl">
        <RetiredNamesTable paginatedData={displayedNames} onNameClick={handleNameClick} />
      </div>

      <RetiredFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        countries={countries}
        matchCount={countMatchingNames}
        initialFilters={{
          name: searchName,
          year: selectedYear,
          country: selectedCountry,
          reason: selectedReason,
          position: searchPosition,
        }}
      />

      <RetiredNameDetailsModal
        isOpen={isRetiredNameModalOpen}
        selectedName={selectedRetiredName}
        suggestions={suggestions}
        onClose={() => setIsRetiredNameModalOpen(false)}
      />
    </>
  );
};

export default RetiredView;
