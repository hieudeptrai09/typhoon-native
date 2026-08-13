import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";

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

const icon = (name: IconName, label: string) => (
  <span className="flex items-center justify-center gap-1.5">
    <Ionicons name={name} size={13} color="#334155" />
    {label}
  </span>
);

export const MODE_OPTIONS = [
  { label: icon(DASHBOARD_ICON_MAP.mode.table, "Grid"), value: "table" },
  { label: icon(DASHBOARD_ICON_MAP.mode.list, "List"), value: "list" },
];

export const FILTER_OPTIONS: Record<string, { label: React.ReactNode; value: string }[]> = {
  all: [
    { label: icon(DASHBOARD_ICON_MAP.filter.position, "Position"), value: "position" },
    { label: icon(DASHBOARD_ICON_MAP.filter.name, "Name"), value: "name" },
  ],
  highlights: [
    { label: icon(DASHBOARD_ICON_MAP.filter.strongest, "Strongest"), value: "strongest" },
    { label: icon(DASHBOARD_ICON_MAP.filter.first, "First"), value: "first" },
    { label: icon(DASHBOARD_ICON_MAP.filter.last, "Last"), value: "last" },
    { label: icon(DASHBOARD_ICON_MAP.filter.untracked, "Untracked"), value: "untracked" },
  ],
  average: [
    { label: icon(DASHBOARD_ICON_MAP.filter.position, "Position"), value: "position" },
    { label: icon(DASHBOARD_ICON_MAP.filter.name, "Name"), value: "name" },
    { label: icon(DASHBOARD_ICON_MAP.filter.country, "Country"), value: "country" },
    { label: icon(DASHBOARD_ICON_MAP.filter.year, "Year"), value: "year" },
    { label: icon(DASHBOARD_ICON_MAP.filter.month, "Month"), value: "month" },
  ],
  recurrence: [
    { label: icon(DASHBOARD_ICON_MAP.filter.position, "Position"), value: "position" },
    { label: icon(DASHBOARD_ICON_MAP.filter.name, "Name"), value: "name" },
  ],
  avgdate: [
    { label: icon(DASHBOARD_ICON_MAP.filter.position, "Position"), value: "position" },
    { label: icon(DASHBOARD_ICON_MAP.filter.name, "Name"), value: "name" },
  ],
};
