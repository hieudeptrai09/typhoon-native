import type { Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { formatDayOfYear, getDoyMonth, type AvgDates } from "@/lib/utils/stormDates";
import PositionCellGrid from "./PositionCellGrid";

interface AvgDateGridProps {
  stormsData: Storm[];
  avgDateValues: Record<number, AvgDates> | null;
  onCellClick: (data: number | string, key: string) => void;
  isClickable?: boolean;
}

const AvgDateGrid = ({
  stormsData,
  avgDateValues,
  onCellClick,
  isClickable = true,
}: AvgDateGridProps) => (
  <PositionCellGrid
    stormsData={stormsData}
    gridCellViewType="storms"
    onPositionClick={(position) => onCellClick(position, "position")}
    renderCell={(position) => {
      const dates = avgDateValues?.[position];
      const hasData = dates && (dates.startDoy >= 0 || dates.endDoy >= 0);
      return {
        content: !hasData ? (
          <span className="text-sm font-bold text-gray-400">—</span>
        ) : (
          <div className="flex flex-col items-center text-xs leading-tight font-bold tabular-nums">
            <span style={{ color: getAvgDateColor(getDoyMonth(dates.startDoy)) }}>
              {formatDayOfYear(dates.startDoy)}
            </span>
            <span className="text-[10px] font-normal text-gray-400">–</span>
            <span style={{ color: getAvgDateColor(getDoyMonth(dates.endDoy)) }}>
              {formatDayOfYear(dates.endDoy)}
            </span>
          </div>
        ),
        className: "",
        clickable: isClickable,
      };
    }}
  />
);

export default AvgDateGrid;
