import type { SegmentOption } from "@/lib/components/common/SegmentedControl";
import { BACKGROUND_BADGE, INTENSITY_LABEL, INTENSITY_SHORT_LABEL } from "@/lib/constants";
import type { IconName } from "@/lib/types";
import { getIntensitySlug, INTENSITIES_BY_STRENGTH } from "@/lib/utils/storm/intensity";

export const DASHBOARD_ICON_MAP: Record<string, Record<string, IconName>> = {
  view: {
    all: "thunderstorm-outline",
    highlights: "star-outline",
    intensity: "speedometer-outline",
    average: "pulse-outline",
    recurrence: "repeat-outline",
    avgdate: "calendar-number-outline",
  },
  filter: {
    strongest: "flash-outline",
    first: "medal-outline",
    last: "download-outline",
    position: "location-outline",
    name: "pricetag-outline",
    country: "globe-outline",
    year: "sunny-outline",
    month: "moon-outline",
  },
  mode: {
    table: "grid-outline",
    list: "list-outline",
  },
};

export const VIEW_TABS: { key: string; label: string }[] = [
  { key: "all", label: "Storms" },
  { key: "highlights", label: "Highlights" },
  { key: "intensity", label: "Intensity" },
  { key: "average", label: "Average" },
  { key: "recurrence", label: "Recurrence" },
  { key: "avgdate", label: "Avg. Date" },
];

export const VIEW_DESCRIPTION: Record<string, string> = {
  all: "Every storm that has used each name",
  highlights: "The record holder in each naming position",
  intensity: "Every storm that peaked at one point on the scale",
  average: "Mean intensity of the storms in each group",
  recurrence: "Typical gap in years between reuses of a name",
  avgdate: "When in the season each group's storms start and end",
};

const filterOption = (value: string, label: string): SegmentOption => ({
  value,
  label,
  icon: DASHBOARD_ICON_MAP.filter[value],
});

export const MODE_OPTIONS: SegmentOption[] = [
  { value: "table", label: "Grid", icon: DASHBOARD_ICON_MAP.mode.table },
  { value: "list", label: "List", icon: DASHBOARD_ICON_MAP.mode.list },
];

export const FILTER_OPTIONS: Record<string, SegmentOption[]> = {
  all: [filterOption("position", "Position"), filterOption("name", "Name")],
  highlights: [
    filterOption("strongest", "Strongest"),
    filterOption("first", "First"),
    filterOption("last", "Last"),
  ],
  intensity: INTENSITIES_BY_STRENGTH.map((intensity) => ({
    value: getIntensitySlug(intensity),
    label: INTENSITY_LABEL[intensity],
    shortLabel: INTENSITY_SHORT_LABEL[intensity],
    // Nine icons would be noise; the badge colour is what the grid and the legend key on anyway.
    swatch: BACKGROUND_BADGE[intensity],
  })),
  average: [
    filterOption("position", "Position"),
    filterOption("name", "Name"),
    filterOption("country", "Country"),
    filterOption("year", "Year"),
    filterOption("month", "Month"),
  ],
  recurrence: [filterOption("position", "Position"), filterOption("name", "Name")],
  avgdate: [
    filterOption("position", "Position"),
    filterOption("name", "Name"),
    filterOption("country", "Country"),
    filterOption("year", "Year"),
  ],
};

// "Group by" is wrong where the options pick one slice of the data rather than a grouping.
const FILTER_LABEL: Record<string, string> = {
  intensity: "Intensity",
};

export const getFilterLabel = (view: string): string => FILTER_LABEL[view] ?? "Group by";
