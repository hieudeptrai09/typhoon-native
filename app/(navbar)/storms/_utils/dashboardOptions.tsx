import { INTENSITY_SHORT_LABEL } from "@/lib/constants";
import type { IntensityType } from "@/lib/types";
import { BACKGROUND_BADGE } from "@/lib/utils/colors";
import { getIntensitySlug, INTENSITIES_BY_STRENGTH } from "@/lib/utils/intensity";
import {
  Activity,
  ArrowDownToLine,
  CalendarRange,
  CalendarSearch,
  CloudLightning,
  Gauge,
  Globe,
  Grid3x3,
  List,
  MapPin,
  Medal,
  Moon,
  Play,
  Repeat,
  Sigma,
  Square,
  Star,
  Sun,
  Tag,
  Waves,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DASHBOARD_ICON_MAP: Record<string, Record<string, LucideIcon>> = {
  view: {
    all: CloudLightning,
    highlights: Star,
    intensity: Gauge,
    average: Activity,
    recurrence: Repeat,
    avgdate: CalendarRange,
    calendar: CalendarSearch,
  },
  filter: {
    strongest: Zap,
    first: Medal,
    last: ArrowDownToLine,
    position: MapPin,
    name: Tag,
    country: Globe,
    year: Sun,
    month: Moon,
    started: Play,
    ended: Square,
    active: Waves,
    todate: Sigma,
  },
  mode: {
    table: Grid3x3,
    list: List,
  },
};

const icon = (Icon: LucideIcon, label: string) => (
  <span className="flex items-center justify-center gap-1.5">
    <Icon size={13} />
    {label}
  </span>
);

// The intensity chips carry their own colour instead of an icon: nine icons would be noise.
const intensityChip = (intensity: IntensityType) => (
  <span className="flex items-center justify-center gap-1.5">
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
      style={{ backgroundColor: BACKGROUND_BADGE[intensity] }}
    />
    {INTENSITY_SHORT_LABEL[intensity]}
  </span>
);

export const MODE_OPTIONS = [
  { label: icon(Grid3x3, "Grid"), value: "table" },
  { label: icon(List, "List"), value: "list" },
];

export const FILTER_OPTIONS: Record<string, { label: React.ReactNode; value: string }[]> = {
  all: [
    { label: icon(MapPin, "Position"), value: "position" },
    { label: icon(Tag, "Name"), value: "name" },
  ],
  highlights: [
    { label: icon(Zap, "Strongest"), value: "strongest" },
    { label: icon(Medal, "First"), value: "first" },
    { label: icon(ArrowDownToLine, "Last"), value: "last" },
  ],
  intensity: INTENSITIES_BY_STRENGTH.map((intensity) => ({
    label: intensityChip(intensity),
    value: getIntensitySlug(intensity),
  })),
  average: [
    { label: icon(MapPin, "Position"), value: "position" },
    { label: icon(Tag, "Name"), value: "name" },
    { label: icon(Globe, "Country"), value: "country" },
    { label: icon(Sun, "Year"), value: "year" },
    { label: icon(Moon, "Month"), value: "month" },
  ],
  recurrence: [
    { label: icon(MapPin, "Position"), value: "position" },
    { label: icon(Tag, "Name"), value: "name" },
  ],
  avgdate: [
    { label: icon(MapPin, "Position"), value: "position" },
    { label: icon(Tag, "Name"), value: "name" },
    { label: icon(Globe, "Country"), value: "country" },
    { label: icon(Sun, "Year"), value: "year" },
  ],
  calendar: [
    { label: icon(Play, "Started"), value: "started" },
    { label: icon(Square, "Ended"), value: "ended" },
    { label: icon(Waves, "Active"), value: "active" },
    { label: icon(Sigma, "So Far"), value: "todate" },
  ],
};

// "Group by" is wrong where the chips pick one slice of the data rather than a grouping.
const FILTER_LABELS: Record<string, string> = {
  intensity: "Intensity",
  calendar: "Show",
};

export const getFilterLabel = (view: string): string => FILTER_LABELS[view] ?? "Group by";
