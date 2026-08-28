import type { IconName, SegmentOption } from "@/lib/types";

export type NamesScope = "names" | "retired";

export const NAME_SCOPE_TABS: { key: NamesScope; label: string; icon: IconName }[] = [
  { key: "names", label: "Naming table", icon: "grid-outline" },
  { key: "retired", label: "Retired", icon: "skull-outline" },
];

export const HISTORY_OPTIONS: SegmentOption[] = [
  { value: "current", label: "Current rotation", icon: "flame-outline" },
  { value: "history", label: "Every name ever", icon: "time-outline" },
];

export const GRID_CONTENT_OPTIONS: SegmentOption[] = [
  { value: "name", label: "Names", icon: "text-outline" },
  { value: "tag", label: "Categories", icon: "pricetag-outline" },
];
