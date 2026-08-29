import { COLOR } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import { isExternalPosition } from "@/lib/utils/position";
import type { DayReason } from "@/lib/utils/storm/calendar";

export interface DayMarker {
  icon: IconName;
  color: string;
  label: string;
}

const ONGOING: DayMarker = {
  icon: "ellipse",
  color: COLOR.accentBorder,
  label: "was already under way",
};

// Positions 141-143 hold storms that wandered in from another basin: they were not born in the
// West Pacific and did not necessarily die there, so they enter and leave it instead.
const EXTERNAL: Record<"started" | "ended" | "both", DayMarker> = {
  started: {
    icon: "log-in-outline",
    color: COLOR.success,
    label: "entered the West Pacific basin",
  },
  ended: {
    icon: "log-out-outline",
    color: COLOR.danger,
    label: "exited the West Pacific basin or dissipated",
  },
  both: {
    icon: "refresh",
    color: COLOR.warning,
    label: "entered and exited the West Pacific basin",
  },
};

const OWN: Record<"started" | "ended" | "both", DayMarker> = {
  started: { icon: "play", color: COLOR.success, label: "formed" },
  ended: { icon: "stop", color: COLOR.danger, label: "dissipated" },
  both: { icon: "refresh", color: COLOR.warning, label: "formed and dissipated" },
};

export const getDayMarker = (reason: DayReason, position: number): DayMarker =>
  reason === null ? ONGOING : (isExternalPosition(position) ? EXTERNAL : OWN)[reason];

const VERBS = {
  own: { start: "Formed", end: "Dissipated" },
  external: { start: "Entered basin", end: "Left basin" },
};

export const verbsFor = (position: number) =>
  isExternalPosition(position) ? VERBS.external : VERBS.own;
