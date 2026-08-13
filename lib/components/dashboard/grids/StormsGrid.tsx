import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { GRID_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { useMemo } from "react";

interface StormsGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
  isClickable?: boolean;
}

// The web grid spelled out each position's label in its cell; here the axes do that,
// so the fill is free to carry how busy the position is.
const COUNT_COLORS = ["#dbeafe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"];
const countColor = (count: number): string =>
  count === 0 ? GRID_EMPTY_CELL_COLOR : COUNT_COLORS[Math.min(count, COUNT_COLORS.length) - 1];

const StormsGrid = ({ stormsData, onCellClick, isClickable = true }: StormsGridProps) => {
  const countByPosition = useMemo(() => {
    const counts = new Map<number, number>();
    stormsData.forEach((storm) =>
      counts.set(storm.position, (counts.get(storm.position) ?? 0) + 1),
    );
    return counts;
  }, [stormsData]);

  return (
    <PositionCellGrid
      stormsData={stormsData}
      onPositionPress={(position) => onCellClick(position, "position")}
      renderValue={(position) => {
        const count = countByPosition.get(position) ?? 0;
        return `${count} storm${count === 1 ? "" : "s"}`;
      }}
      renderCell={(position) => {
        const count = countByPosition.get(position) ?? 0;
        return {
          color: countColor(count),
          label: count > 0 ? String(count) : undefined,
          labelColor: count >= 4 ? "#ffffff" : "#0f172a",
          clickable: isClickable,
        };
      }}
    />
  );
};

export default StormsGrid;
