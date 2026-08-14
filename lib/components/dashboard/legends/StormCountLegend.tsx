import LegendShell, { LegendItem } from "@/lib/components/common/LegendShell";
import { GRID_EMPTY_CELL_COLOR, STORM_COUNT_COLORS } from "@/lib/constants/colors";

const label = (index: number) =>
  index === STORM_COUNT_COLORS.length - 1 ? `${index + 1}+` : String(index + 1);

export default function StormCountLegend() {
  return (
    <LegendShell label="Storms per position:" accessibilityLabel="Storms per position legend">
      <LegendItem label="0" color={GRID_EMPTY_CELL_COLOR} />
      {STORM_COUNT_COLORS.map((color, index) => (
        <LegendItem key={color} label={label(index)} color={color} />
      ))}
    </LegendShell>
  );
}
