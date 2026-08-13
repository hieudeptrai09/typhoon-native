import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { GRID_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getDistanceColor } from "@/lib/utils/colors";

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
}: DistanceGridProps) => (
  <PositionCellGrid
    stormsData={stormsData}
    onPositionPress={(position) => onCellClick(position, "position")}
    renderValue={(position) => {
      const dist = distanceValues?.[position];
      if (dist === undefined) return undefined;
      // A negative gap means there was nothing to measure against.
      return dist < 0 ? "Recurrence not measurable" : `Avg recurrence ${dist.toFixed(2)} years`;
    }}
    renderCell={(position) => {
      const dist = distanceValues?.[position];
      return {
        color: dist === undefined ? GRID_EMPTY_CELL_COLOR : getDistanceColor(dist),
        clickable: isClickable,
      };
    }}
  />
);

export default DistanceGrid;
