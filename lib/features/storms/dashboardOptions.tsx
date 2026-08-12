import {
  Activity,
  ArrowDownToLine,
  CalendarRange,
  CloudLightning,
  EyeOff,
  Globe,
  Grid3x3,
  List,
  MapPin,
  Medal,
  Moon,
  Repeat,
  Star,
  Sun,
  Tag,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DASHBOARD_ICON_MAP: Record<string, Record<string, LucideIcon>> = {
  view: {
    all: CloudLightning,
    highlights: Star,
    average: Activity,
    recurrence: Repeat,
    avgdate: CalendarRange,
  },
  filter: {
    strongest: Zap,
    first: Medal,
    last: ArrowDownToLine,
    untracked: EyeOff,
    position: MapPin,
    name: Tag,
    country: Globe,
    year: Sun,
    month: Moon,
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
    { label: icon(EyeOff, "Untracked"), value: "untracked" },
  ],
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
  ],
};
