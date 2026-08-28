import { EMPTY_POSITION_CELL_CLASS, getHighlightCellClass } from "@/lib/utils/colors";
import LegendShell, { LegendItem } from "./LegendShell";

const HIGHLIGHT_LABEL: Record<string, string> = {
  strongest: "Strongest storm at this position",
  first: "First storm at this position",
  last: "Last storm at this position",
};

interface HighlightsLegendProps {
  filter: string;
}

export default function HighlightsLegend({ filter }: HighlightsLegendProps) {
  return (
    <LegendShell label="Grid key:" ariaLabel="Highlights grid legend">
      <LegendItem
        colorClass={getHighlightCellClass(filter)}
        label={HIGHLIGHT_LABEL[filter] ?? "Highlighted storm"}
      />
      <LegendItem colorClass={EMPTY_POSITION_CELL_CLASS} label="No storm at this position" />
    </LegendShell>
  );
}
