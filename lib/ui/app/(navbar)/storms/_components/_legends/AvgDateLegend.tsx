import { AVG_DATE_FALLBACK_COLOR, AVG_DATE_MONTH_COLOR } from "@/lib/utils/colors";
import LegendShell, { LegendItem } from "./LegendShell";

const AVG_DATE_LEGEND: { color: string; label: string }[] = [
  { color: AVG_DATE_MONTH_COLOR[6], label: "June" },
  { color: AVG_DATE_MONTH_COLOR[7], label: "July" },
  { color: AVG_DATE_MONTH_COLOR[8], label: "August" },
  { color: AVG_DATE_MONTH_COLOR[9], label: "September" },
  { color: AVG_DATE_MONTH_COLOR[10], label: "October" },
  { color: AVG_DATE_FALLBACK_COLOR, label: "November – May" },
];

export default function AvgDateLegend() {
  return (
    <LegendShell label="Average month:" ariaLabel="Average date month legend">
      {AVG_DATE_LEGEND.map(({ color, label }) => (
        <LegendItem key={label} color={color} label={label} />
      ))}
    </LegendShell>
  );
}
