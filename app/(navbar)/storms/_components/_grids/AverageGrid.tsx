import type { Storm } from "@/lib/types";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import { getIntensityFromNumber } from "@/lib/utils/storms";
import PositionCellGrid from "./PositionCellGrid";

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
    gridCellViewType="average"
    onPositionClick={(position) => onCellClick(position, "position")}
    renderCell={(position) => {
      const avgNumber = averageValues?.[position];
      const textColor =
        avgNumber !== undefined
          ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(avgNumber)]
          : "#374151";
      return {
        content: (
          <div className="text-center text-base font-semibold" style={{ color: textColor }}>
            {getPositionTitle(position)}
          </div>
        ),
        className: "",
        clickable: isClickable,
      };
    }}
  />
);

export default AverageGrid;
