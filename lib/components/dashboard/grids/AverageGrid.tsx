import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import {
  BACKGROUND_BADGE,
  GRID_EMPTY_CELL_COLOR,
  INTENSITY_LABEL,
  TEXT_COLOR_BADGE,
} from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getIntensityFromNumber } from "@/lib/utils/storm/aggregate";

interface AverageGridProps {
  stormsData: Storm[];
  averageValues: Record<number, number> | null;
  onCellClick: (data: number | string, key: string) => void;
  isClickable?: boolean;
}

const AverageGrid = ({
  stormsData,
  averageValues,
  onCellClick,
  isClickable = true,
}: AverageGridProps) => (
  <PositionCellGrid
    stormsData={stormsData}
    onPositionPress={(position) => onCellClick(position, "position")}
    renderValue={(position) => {
      const avg = averageValues?.[position];
      if (avg === undefined) return undefined;
      return `Avg ${avg.toFixed(2)} — ${INTENSITY_LABEL[getIntensityFromNumber(avg)]}`;
    }}
    renderCell={(position) => {
      const avg = averageValues?.[position];
      if (avg === undefined) return { color: GRID_EMPTY_CELL_COLOR, clickable: isClickable };

      const intensity = getIntensityFromNumber(avg);
      return {
        color: BACKGROUND_BADGE[intensity],
        label: intensity,
        labelColor: TEXT_COLOR_BADGE[intensity],
        clickable: isClickable,
      };
    }}
  />
);

export default AverageGrid;
