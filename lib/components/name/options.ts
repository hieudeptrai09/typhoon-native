import type { SegmentOption } from "@/lib/components/common/SegmentedControl";
import type { IconName } from "@/lib/types";

export type NamesScope = "current" | "history" | "retired";
export type NamesLayout = "grid" | "list";

export const NAME_SCOPE_TABS: { key: NamesScope; label: string; icon: IconName }[] = [
  { key: "current", label: "Current", icon: "flame-outline" },
  { key: "history", label: "History", icon: "time-outline" },
  { key: "retired", label: "Retired", icon: "skull-outline" },
];

// A three-word tab cannot say what separates "Current" from "History" from "Retired", and getting
// it wrong costs a round trip through a data fetch.
export const NAME_SCOPE_DESCRIPTION: Record<NamesScope, string> = {
  current: "The names in the rotation as it stands today",
  history: "Every name each position has carried, and how often it was used",
  retired: "Names withdrawn for good, and what was proposed to replace them",
};

export const LAYOUT_OPTIONS: SegmentOption<NamesLayout>[] = [
  { value: "grid", label: "Table", icon: "grid-outline" },
  { value: "list", label: "List", icon: "list-outline" },
];

export const GRID_CONTENT_OPTIONS: SegmentOption[] = [
  { value: "name", label: "Names", icon: "text-outline" },
  { value: "tag", label: "Categories", icon: "pricetag-outline" },
];
