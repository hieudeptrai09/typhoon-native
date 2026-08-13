import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { GRID_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { formatDayOfYear, getDoyMonth, type AvgDates } from "@/lib/utils/storm/dates";

interface AvgDateGridProps {
  stormsData: Storm[];
  avgDateValues: Record<number, AvgDates> | null;
  onCellClick: (data: number | string, key: string) => void;
  isClickable?: boolean;
}

const hasDates = (dates?: AvgDates): dates is AvgDates =>
  dates !== undefined && (dates.startDoy >= 0 || dates.endDoy >= 0);

const AvgDateGrid = ({
  stormsData,
  avgDateValues,
  onCellClick,
  isClickable = true,
}: AvgDateGridProps) => (
  <PositionCellGrid
    stormsData={stormsData}
    onPositionPress={(position) => onCellClick(position, "position")}
    renderValue={(position) => {
      const dates = avgDateValues?.[position];
      if (!hasDates(dates)) return undefined;
      return `${formatDayOfYear(dates.startDoy)} – ${formatDayOfYear(dates.endDoy)}`;
    }}
    renderCell={(position) => {
      const dates = avgDateValues?.[position];
      // The season's start month is what the colour scale reads; the readout carries both dates.
      return {
        color: hasDates(dates)
          ? getAvgDateColor(getDoyMonth(dates.startDoy))
          : GRID_EMPTY_CELL_COLOR,
        clickable: isClickable,
      };
    }}
  />
);

export default AvgDateGrid;
