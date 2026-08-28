import ComparisonBarList, { type ComparisonBarRow } from "@/lib/components/ComparisonBarList";
import DefModal from "@/lib/components/DefModal";
import StatTile from "@/lib/components/StatTile";
import { MONTH_NAMES } from "@/lib/constants";
import type { BaseModalProps, Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { formatStormDateRange, parseStormDate } from "@/lib/utils/date";
import {
  calculateAvgDates,
  calculateAvgDuration,
  formatDayOfYear,
  formatDuration,
  getDoyMonth,
} from "@/lib/utils/stormDates";

interface AvgDateModalProps extends BaseModalProps {
  title: string;
  storms: Storm[];
}

interface MonthGroup {
  month: number;
  label: string;
  count: number;
  storms: Storm[];
}

const groupByStartMonth = (storms: Storm[]): MonthGroup[] => {
  const buckets = new Map<number, Storm[]>();
  storms.forEach((storm) => {
    const { month } = parseStormDate(storm.dateStart);
    if (!buckets.has(month)) buckets.set(month, []);
    buckets.get(month)!.push(storm);
  });

  return [...buckets.entries()]
    .map(([month, groupStorms]) => ({
      month,
      label: MONTH_NAMES[month],
      count: groupStorms.length,
      storms: [...groupStorms].sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => a.month - b.month);
};

const AvgDateModal = ({ isOpen, onClose, title, storms }: AvgDateModalProps) => {
  const { startDoy, endDoy } = calculateAvgDates(storms);
  const avgDuration = calculateAvgDuration(storms);
  const rows: ComparisonBarRow[] = groupByStartMonth(storms).map((group) => ({
    key: group.label,
    label: group.label,
    color: getAvgDateColor(group.month),
    count: group.count,
    details: (
      <div className="flex flex-col gap-1.5">
        {group.storms.map((storm) => (
          <div key={`${storm.name}-${storm.year}`} className="text-sm text-foreground">
            <span className="font-semibold text-sky-800">{storm.name}</span> {storm.year}
            <span className="text-xs text-gray-500">
              {" · "}
              {formatStormDateRange(storm.dateStart, storm.dateEnd)}
            </span>
          </div>
        ))}
      </div>
    ),
  }));

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      width={448}
      title={<span className="text-2xl font-bold text-sky-800">{title}</span>}
    >
      <div className="space-y-4 pt-3">
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Avg. Start" title="Average start date">
            <span style={{ color: getAvgDateColor(getDoyMonth(startDoy)) }}>
              {formatDayOfYear(startDoy)}
            </span>
          </StatTile>
          <StatTile label="Avg. End" title="Average end date">
            <span style={{ color: getAvgDateColor(getDoyMonth(endDoy)) }}>
              {formatDayOfYear(endDoy)}
            </span>
          </StatTile>
          <StatTile label="Avg. Duration" title="Average days from start to end">
            <span className="text-slate-700">{formatDuration(avgDuration)}</span>
          </StatTile>
        </div>

        <ComparisonBarList
          heading="Storms by start month:"
          emptyText="No storms to show."
          rows={rows}
        />
      </div>
    </DefModal>
  );
};

export default AvgDateModal;
