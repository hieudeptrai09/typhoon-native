import {
  DISTANCE_LONG_COLOR,
  DISTANCE_NA_COLOR,
  DISTANCE_SHORT_COLOR,
  DISTANCE_STANDARD_COLOR,
} from "@/lib/utils/colors";
import LegendShell, { LegendItem } from "./LegendShell";

const RECURRENCE_LEGEND: { color: string; label: string }[] = [
  { color: DISTANCE_SHORT_COLOR, label: "Under 6 years" },
  { color: DISTANCE_STANDARD_COLOR, label: "Exactly 6 years" },
  { color: DISTANCE_LONG_COLOR, label: "Over 6 years" },
  { color: DISTANCE_NA_COLOR, label: "N/A (single storm)" },
];

export default function RecurrenceLegend() {
  return (
    <LegendShell label="Average Recurrence:" ariaLabel="Average recurrence legend">
      {RECURRENCE_LEGEND.map(({ color, label }) => (
        <LegendItem key={label} color={color} label={label} />
      ))}
    </LegendShell>
  );
}
