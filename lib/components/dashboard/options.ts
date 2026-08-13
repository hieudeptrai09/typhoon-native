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
  avgdate: [filterOption("position", "Position"), filterOption("name", "Name")],
};
