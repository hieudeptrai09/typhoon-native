import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { HIGHLIGHT_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getHighlightCellColor } from "@/lib/utils/colors";
import { useCallback, useMemo } from "react";

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

  const renderValue = useCallback(
    (position: number) => {
      const storms = byPosition.get(position);
      if (!storms || storms.length === 0) return undefined;
      return storms.map((storm) => `${storm.name} (${storm.year})`);
    },
    [byPosition],
  );

  const renderCell = useCallback(
    (position: number) => ({
      color: byPosition.has(position)
        ? getHighlightCellColor(highlightType)
        : HIGHLIGHT_EMPTY_CELL_COLOR,
      clickable: false,
    }),
    [byPosition, highlightType],
  );

  return (
    <PositionCellGrid stormsData={stormsData} renderValue={renderValue} renderCell={renderCell} />
  );
};

export default HighlightsGrid;
