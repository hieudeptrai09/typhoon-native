import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { GRID_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { formatDayOfYear, getDoyMonth, type AvgDates } from "@/lib/utils/storm/dates";
import { useCallback } from "react";

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
}: AvgDateGridProps) => {
  const renderValue = useCallback(
    (position: number) => {
      const dates = avgDateValues?.[position];
      if (!hasDates(dates)) return undefined;
      return [`${formatDayOfYear(dates.startDoy)} – ${formatDayOfYear(dates.endDoy)}`];
    },
    [avgDateValues],
  );

  const renderCell = useCallback(
    (position: number) => {
      const dates = avgDateValues?.[position];
      return {
        color: hasDates(dates)
          ? getAvgDateColor(getDoyMonth(dates.startDoy))
          : GRID_EMPTY_CELL_COLOR,
        clickable: isClickable,
      };
    },
    [avgDateValues, isClickable],
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

export default AvgDateGrid;
