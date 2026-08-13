import LegendShell, { LegendItem } from "@/lib/components/common/LegendShell";
import { HIGHLIGHT_EMPTY_CELL_COLOR } from "@/lib/constants";
import { getHighlightCellColor } from "@/lib/utils/colors";

const HIGHLIGHT_LABEL: Record<string, string> = {
  strongest: "Strongest storm at this position",
  first: "First storm at this position",
  last: "Last storm at this position",
  untracked: "Storm not tracked by the JTWC",
};

interface HighlightsLegendProps {
  filter: string;
}

export default function HighlightsLegend({ filter }: HighlightsLegendProps) {
  return (
    <LegendShell label="Grid key:" accessibilityLabel="Highlights grid legend">
      <LegendItem
        color={getHighlightCellColor(filter)}
        label={HIGHLIGHT_LABEL[filter] ?? "Highlighted storm"}
      />
      <LegendItem color={HIGHLIGHT_EMPTY_CELL_COLOR} label="No storm at this position" />
    </LegendShell>
  );
}
