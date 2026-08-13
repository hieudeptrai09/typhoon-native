import LegendShell, { LegendItem } from "@/lib/components/common/LegendShell";
import { NAME_REUSE_COLORS } from "@/lib/constants/colors";

const label = (index: number) =>
  index === NAME_REUSE_COLORS.length - 1 ? `${index + 1}+` : String(index + 1);

export default function ReuseCountLegend() {
  return (
    <LegendShell label="Times used:" accessibilityLabel="Times a name was used legend">
      {NAME_REUSE_COLORS.map((color, index) => (
        <LegendItem key={color} label={label(index)} color={color} />
      ))}
    </LegendShell>
  );
}
