import { BACKGROUND_BADGE, INTENSITY_LABEL, INTENSITY_SHORT_LABEL } from "@/lib/constants";
import type { IconName, SegmentOption } from "@/lib/types";
import { getIntensitySlug, INTENSITIES_BY_STRENGTH } from "@/lib/utils/storm/intensity";

export const VIEW_TABS: SegmentOption[] = [
  {
    value: "all",
    label: "Storms",
    icon: "thunderstorm-outline",
    description: "Every storm the naming table has ever carried",
  },
  {
    value: "records",
    label: "Records",
    icon: "star-outline",
    description: "One slice of the record book at a time",
  },
  {
    value: "stats",
    label: "Stats",
    icon: "stats-chart-outline",
    description: "One statistic worked out for every group",
  },
];

export const METRIC_OPTIONS: SegmentOption[] = [
  {
    value: "intensity",
    label: "Avg. intensity",
    shortLabel: "Intensity",
    icon: "pulse-outline",
    description: "Mean intensity of the storms in each group",
  },
  {
    value: "recurrence",
    label: "Recurrence",
    icon: "repeat-outline",
    description:
      "Typical gap in years between reuses. The 140-position list takes about six years to come round, so the grid reads against six.",
  },
  {
    value: "dates",
    label: "Season dates",
    shortLabel: "Dates",
    icon: "calendar-number-outline",
    description: "When in the season each group's storms start and end",
  },
];

const GROUP_ICON: Record<string, IconName> = {
  position: "location-outline",
  name: "pricetag-outline",
  country: "globe-outline",
  year: "sunny-outline",
  month: "moon-outline",
};

const groupOption = (value: string, label: string): SegmentOption => ({
  value,
  label,
  icon: GROUP_ICON[value],
});

const GROUP_OPTIONS: SegmentOption[] = [
  groupOption("position", "Position"),
  groupOption("name", "Name"),
  groupOption("country", "Country"),
  groupOption("year", "Year"),
  groupOption("month", "Month"),
];

const RECORD_OPTIONS: SegmentOption[] = [
  {
    value: "strongest",
    label: "Strongest",
    icon: "flash-outline",
    description: "The peak storm of each naming position",
  },
  {
    value: "first",
    label: "First",
    icon: "medal-outline",
    description: "The first storm to use each name",
  },
  {
    value: "last",
    label: "Last",
    icon: "download-outline",
    description: "The most recent storm at each position",
  },
  ...INTENSITIES_BY_STRENGTH.map((intensity) => ({
    value: getIntensitySlug(intensity),
    label: INTENSITY_LABEL[intensity],
    shortLabel: INTENSITY_SHORT_LABEL[intensity],
    swatch: BACKGROUND_BADGE[intensity],
  })),
];

export const MODE_OPTIONS: SegmentOption[] = [
  { value: "table", label: "Grid", icon: "grid-outline" },
  { value: "list", label: "List", icon: "list-outline" },
];

export const filterOptionsFor = (view: string): SegmentOption[] =>
  view === "records" ? RECORD_OPTIONS : GROUP_OPTIONS.slice(0, view === "all" ? 2 : undefined);

// "Group by" is wrong on records, where the options pick one slice rather than a grouping.
export const filterLabelFor = (view: string): string => (view === "records" ? "Show" : "Group by");

export const optionFor = (options: SegmentOption[], value: string): SegmentOption | undefined =>
  options.find((option) => option.value === value);
