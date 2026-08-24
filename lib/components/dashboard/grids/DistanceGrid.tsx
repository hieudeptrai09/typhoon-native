import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { GRID_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getDistanceColor } from "@/lib/utils/colors";
import { useCallback } from "react";

interface DistanceGridProps {
  stormsData: Storm[];
  distanceValues: Record<number, number> | null;
  onCellClick: (data: number | string, key: string) => void;
  isClickable?: boolean;
}

const DistanceGrid = ({
  stormsData,
  distanceValues,
  onCellClick,
  isClickable = true,
}: DistanceGridProps) => {
  const renderValue = useCallback(
    (position: number) => {
      const dist = distanceValues?.[position];
      if (dist === undefined) return undefined;
      // A negative gap means there was nothing to measure against.
      return [dist < 0 ? "Recurrence not measurable" : `Avg recurrence ${dist.toFixed(2)} years`];
    },
    [distanceValues],
  );

  const renderCell = useCallback(
    (position: number) => {
      const dist = distanceValues?.[position];
      return {
        color: dist === undefined ? GRID_EMPTY_CELL_COLOR : getDistanceColor(dist),
        clickable: isClickable,
      };
    },
    [distanceValues, isClickable],
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

export default DistanceGrid;
