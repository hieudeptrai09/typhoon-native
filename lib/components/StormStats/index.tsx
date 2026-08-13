import StatTile from "@/lib/components/StatTile";
import { INTENSITY_LABEL } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getAvgDateColor, getDistanceColor, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import {
  calculateAvgDates,
  calculateAvgDuration,
  formatDayOfYear,
  formatDuration,
  getDoyMonth,
} from "@/lib/utils/stormDates";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getIntensityFromNumber,
} from "@/lib/utils/storms";

const DatePart = ({ doy }: { doy: number }) => (
  <span style={{ color: getAvgDateColor(getDoyMonth(doy)) }}>{formatDayOfYear(doy)}</span>
);

const StormStats = ({ storms }: { storms: Storm[] }) => {
  if (storms.length === 0) return null;

  const average = calculateAverage(storms);
  const intensity = getIntensityFromNumber(average);
  const recurrence = calculateGapAverage(storms);
  const { startDoy, endDoy } = calculateAvgDates(storms);
  const duration = calculateAvgDuration(storms);

  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-2 @3xl:grid-cols-4">
        <StatTile label="Avg. intensity" title={`${INTENSITY_LABEL[intensity]} on a −2 to 5 scale`}>
          <span style={{ color: TEXT_COLOR_WHITE_BACKGROUND[intensity] }}>
            {average.toFixed(2)}
          </span>
        </StatTile>

        <StatTile
          label="Recurrence"
          title={
            recurrence < 0
              ? "Only one storm, so no recurrence can be measured"
              : "Average years between appearances"
          }
        >
          <span style={{ color: getDistanceColor(recurrence) }}>{formatDistance(recurrence)}</span>
          {recurrence >= 0 && <span className="ml-1 text-xs text-foreground">yrs</span>}
        </StatTile>

        <StatTile label="Avg. date" title="Average start and end date">
          <DatePart doy={startDoy} />
          <span className="text-gray-400"> – </span>
          <DatePart doy={endDoy} />
        </StatTile>

        <StatTile label="Avg. duration" title="Average days from start to end">
          <span className="text-slate-700">{formatDuration(duration)}</span>
        </StatTile>
      </div>
    </div>
  );
};

export default StormStats;
