import type {
  FilterParams,
  RetiredFilterParams,
  RetiredName,
  RetirementReason,
  TyphoonName,
} from "@/lib/types";
import { toArr, toStr } from "@/lib/utils/params";
import { getPositionTitle } from "@/lib/utils/position";

export const EMPTY_NAME_FILTERS: FilterParams = {
  name: "",
  country: "",
  language: "",
  tag: "",
  position: "",
  status: "",
};

export const EMPTY_RETIRED_FILTERS: RetiredFilterParams = {
  name: "",
  year: "",
  country: "",
  reason: "",
  position: "",
};

export const NAME_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  retired: "Retired",
  current: "Current",
};

export const RETIREMENT_REASON_LABEL: Record<string, string> = {
  destructive: "Destructive Storm",
  language: "Language Problem",
  misspell: "Misspelling",
  special: "Special Storm",
};

export const applyNameFilters = (names: TyphoonName[], filters: FilterParams): TyphoonName[] => {
  const country = toArr(filters.country);
  const language = toArr(filters.language);
  const tag = toArr(filters.tag);
  const query = filters.name.toLowerCase();

  return names.filter((name) => {
    if (query && !name.name.toLowerCase().includes(query)) return false;
    if (country.length > 0 && !country.includes(name.country)) return false;
    if (language.length > 0 && !language.includes(name.language)) return false;
    if (tag.length > 0 && !tag.includes(name.tag)) return false;
    if (filters.position && name.position !== Number(filters.position)) return false;
    if (filters.status === "active" && name.isRetired) return false;
    if (filters.status === "retired" && !name.isRetired) return false;
    // "Current" is the rotation as it stands: a retired name still counts until its replacement
    // has actually taken the slot.
    if (filters.status === "current" && name.isRetired && name.isReplaced) return false;
    return true;
  });
};

export const applyRetiredFilters = (
  names: RetiredName[],
  filters: RetiredFilterParams,
): RetiredName[] => {
  const country = toArr(filters.country);
  const reason = toArr(filters.reason) as RetirementReason[];
  const query = filters.name.toLowerCase();

  return names.filter((name) => {
    if (query && !name.name.toLowerCase().includes(query)) return false;
    if (filters.year && name.lastYear !== Number(filters.year)) return false;
    if (country.length > 0 && !country.includes(name.country)) return false;
    if (reason.length > 0 && !(name.retirementReason && reason.includes(name.retirementReason))) {
      return false;
    }
    if (filters.position && name.position !== Number(filters.position)) return false;
    return true;
  });
};

export interface FilterChip {
  key: string;
  label: string;
}

const multiChips = (
  field: string,
  csv: string,
  label: (value: string) => string = (value) => value,
): FilterChip[] => toArr(csv).map((value) => ({ key: `${field}:${value}`, label: label(value) }));

const singleChip = (field: string, value: string, label: string): FilterChip[] =>
  value ? [{ key: field, label }] : [];

export const nameFilterChips = (filters: FilterParams, showStatus: boolean): FilterChip[] => [
  ...singleChip("name", filters.name, `"${filters.name}"`),
  ...multiChips("country", filters.country),
  ...multiChips("language", filters.language),
  ...multiChips("tag", filters.tag),
  ...singleChip("position", filters.position, getPositionTitle(Number(filters.position))),
  ...(showStatus
    ? singleChip("status", filters.status, NAME_STATUS_LABEL[filters.status] ?? filters.status)
    : []),
];

export const retiredFilterChips = (filters: RetiredFilterParams): FilterChip[] => [
  ...singleChip("name", filters.name, `"${filters.name}"`),
  ...singleChip("year", filters.year, filters.year),
  ...multiChips("country", filters.country),
  ...multiChips("reason", filters.reason, (value) => RETIREMENT_REASON_LABEL[value] ?? value),
  ...singleChip("position", filters.position, getPositionTitle(Number(filters.position))),
];

// A chip key is either "field" (whole field clears) or "field:value" (one value of a multi-select).
const withoutChip = <T extends object>(filters: T, chipKey: string): T => {
  const [field, value] = chipKey.split(/:(.*)/s);
  const current = (filters as Record<string, string>)[field] ?? "";
  const next = value === undefined ? "" : toStr(toArr(current).filter((v) => v !== value));
  return { ...filters, [field]: next } as T;
};

export const clearNameFilter = (filters: FilterParams, chipKey: string): FilterParams =>
  withoutChip(filters, chipKey);

export const clearRetiredFilter = (
  filters: RetiredFilterParams,
  chipKey: string,
): RetiredFilterParams => withoutChip(filters, chipKey);
