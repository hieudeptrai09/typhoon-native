import { getAvgDateColor, getDistanceColor, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { SPECIAL_POSITIONS } from "@/lib/utils/position";
import { getIntensityFromNumber } from "@/lib/utils/storms";
import { Button } from "antd";
import { formatDayOfYear, getDoyMonth, type AvgDates } from "@/lib/utils/stormDates";

interface SpecialButtonsProps {
  onCellClick: (data: number, key: string) => void;
  isAverageView?: boolean;
  averageValues?: Record<number, number> | null;
  distanceValues?: Record<number, number> | null;
  avgDateValues?: Record<number, AvgDates> | null;
}

const SpecialButtons = ({
  onCellClick,
  isAverageView = false,
  averageValues = null,
  distanceValues = null,
  avgDateValues = null,
}: SpecialButtonsProps) => {
  const getButtonContent = (buttonId: number): { color: string; suffix: string } => {
    if (avgDateValues && avgDateValues[buttonId] !== undefined) {
      const { startDoy, endDoy } = avgDateValues[buttonId];
      return {
        color: getAvgDateColor(getDoyMonth(startDoy)),
        suffix:
          startDoy < 0 && endDoy < 0
            ? ""
            : ` · ${formatDayOfYear(startDoy)}–${formatDayOfYear(endDoy)}`,
      };
    }
    if (distanceValues && distanceValues[buttonId] !== undefined) {
      const dist = distanceValues[buttonId];
      return {
        color: getDistanceColor(dist),
        suffix: dist < 0 ? "" : ` · ${dist.toFixed(2)}y`,
      };
    }
    if (isAverageView && averageValues && averageValues[buttonId]) {
      const avgNumber = averageValues[buttonId];
      const intensityLabel = getIntensityFromNumber(avgNumber);
      return {
        color: TEXT_COLOR_WHITE_BACKGROUND[intensityLabel],
        suffix: "",
      };
    }
    return { color: "#374151", suffix: "" };
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-4">
      <div className="mr-2 text-sm font-semibold text-foreground">Other Regions:</div>
      {SPECIAL_POSITIONS.map((button) => {
        const { color, suffix } = getButtonContent(button.id);
        return (
          <Button
            key={button.id}
            onClick={() => onCellClick(button.id, "position")}
            aria-label={`View storms from ${button.label} region`}
            style={{ color }}
            className="font-semibold!"
          >
            {button.label}
            {suffix}
          </Button>
        );
      })}
    </div>
  );
};

export default SpecialButtons;
