import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { GRID_EMPTY_CELL_COLOR, STORM_COUNT_COLORS } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { useCallback, useMemo } from "react";

interface StormsGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
  isClickable?: boolean;
}

const countColor = (count: number): string =>
  count === 0
    ? GRID_EMPTY_CELL_COLOR
    : STORM_COUNT_COLORS[Math.min(count, STORM_COUNT_COLORS.length) - 1];

const StormsGrid = ({ stormsData, onCellClick, isClickable = true }: StormsGridProps) => {
  const countByPosition = useMemo(() => {
    const counts = new Map<number, number>();
    stormsData.forEach((storm) =>
      counts.set(storm.position, (counts.get(storm.position) ?? 0) + 1),
    );
    return counts;
  }, [stormsData]);

  // PositionCellGrid memoises 140 cells against these, so an inline arrow would rebuild all of
  // them on every render of this component.
  const renderValue = useCallback(
    (position: number) => {
      const count = countByPosition.get(position) ?? 0;
      return [`${count} storm${count === 1 ? "" : "s"}`];
    },
    [countByPosition],
  );

  const renderCell = useCallback(
    (position: number) => {
      const count = countByPosition.get(position) ?? 0;
      return {
        color: countColor(count),
        label: count > 0 ? String(count) : undefined,
        labelColor: count >= 4 ? "#ffffff" : "#0f172a",
        clickable: isClickable,
      };
    },
    [countByPosition, isClickable],
  );

  const handlePress = useCallback(
    (position: number) => onCellClick(position, "position"),
    [onCellClick],
  );

  return (
    <PositionCellGrid
      stormsData={stormsData}
      onPositionPress={handlePress}
      renderValue={renderValue}
      renderCell={renderCell}
    />
  );
};

export default StormsGrid;
