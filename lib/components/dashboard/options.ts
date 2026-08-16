import type { SegmentOption } from "@/lib/components/common/SegmentedControl";
import type { IconName } from "@/lib/types";

export const DASHBOARD_ICON_MAP: Record<string, Record<string, IconName>> = {
  view: {
    all: "thunderstorm-outline",
    highlights: "star-outline",
    average: "pulse-outline",
    recurrence: "repeat-outline",
    avgdate: "calendar-number-outline",
  },
  filter: {
    strongest: "flash-outline",
    first: "medal-outline",
    last: "download-outline",
    untracked: "eye-off-outline",
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
  { key: "average", label: "Average" },
  { key: "recurrence", label: "Recurrence" },
  { key: "avgdate", label: "Avg. Date" },
];

export const VIEW_DESCRIPTION: Record<string, string> = {
  all: "Every storm that has used each name",
  highlights: "The record holder in each naming position",
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
    filterOption("untracked", "Untracked"),
  ],
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
