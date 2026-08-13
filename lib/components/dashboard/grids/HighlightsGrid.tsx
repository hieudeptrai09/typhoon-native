import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { HIGHLIGHT_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getHighlightCellColor } from "@/lib/utils/colors";
import { useMemo } from "react";

interface HighlightsGridProps {
  stormsData: Storm[];
  highlightedStorms: Storm[];
  highlightType: string;
}

const HighlightsGrid = ({ stormsData, highlightedStorms, highlightType }: HighlightsGridProps) => {
  const byPosition = useMemo(() => {
    const map = new Map<number, Storm[]>();
    highlightedStorms.forEach((storm) => {
      map.set(storm.position, [...(map.get(storm.position) ?? []), storm]);
    });
    return map;
  }, [highlightedStorms]);

  return (
    <PositionCellGrid
      stormsData={stormsData}
      renderValue={(position) => {
        const storms = byPosition.get(position);
        if (!storms || storms.length === 0) return undefined;
        return storms.map((storm) => `${storm.name} (${storm.year})`).join(", ");
      }}
      renderCell={(position) => ({
        color: byPosition.has(position)
          ? getHighlightCellColor(highlightType)
          : HIGHLIGHT_EMPTY_CELL_COLOR,
        clickable: false,
      })}
    />
  );
};

export default HighlightsGrid;
