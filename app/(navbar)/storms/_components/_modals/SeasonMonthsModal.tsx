import ComparisonBarList, { type ComparisonBarRow } from "@/lib/components/ComparisonBarList";
import DefModal from "@/lib/components/DefModal";
import StatTile from "@/lib/components/StatTile";
import { MONTH_NAMES } from "@/lib/constants";
import type { BaseModalProps } from "@/lib/types";
import { getAvgDateColor, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { formatOrdinalDate, formatStormDateRange } from "@/lib/utils/date";
import { getSeasonMonths, hasStartedBy, type SeasonToDateRow } from "../../_utils/calendar";

interface SeasonMonthsModalProps extends BaseModalProps {
  row: SeasonToDateRow | null;
  monthDay: string;
}

const SeasonMonthsModal = ({ isOpen, onClose, row, monthDay }: SeasonMonthsModalProps) => {
  const months = row ? getSeasonMonths(row.storms, monthDay) : [];
  const share = row && row.total > 0 ? row.toDate / row.total : 0;
  const rows: ComparisonBarRow[] = months.map((month) => {
    const color = getAvgDateColor(month.month);
    const total = month.storms.length;

    return {
      key: String(month.month),
      label: MONTH_NAMES[month.month],
      color,
      count: total,
      filled: month.toDate,
      valueLabel: month.toDate === total ? total : `${month.toDate} of ${total}`,
      details: (
        <div className="flex flex-col gap-1.5">
          {month.storms.map((storm, index) => (
            <div key={`${storm.name}-${index}`} className="text-sm text-foreground">
              <span
                className="font-semibold"
                style={{ color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }}
              >
                {storm.name}
              </span>
              <span className="text-xs text-gray-500">
                {" · "}
                {formatStormDateRange(storm.dateStart, storm.dateEnd)}
              </span>
              {!hasStartedBy(storm, monthDay) && (
                <span className="text-xs text-gray-500"> · after this day</span>
              )}
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <DefModal
      open={isOpen && row !== null}
      onClose={onClose}
      width={448}
      title={
        <span className="text-2xl font-bold text-foreground">
          {row ? formatOrdinalDate(monthDay, row.year) : ""}
        </span>
      }
    >
      <div className="space-y-4 pt-3">
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="By this day" title="Storms the season had produced by the chosen date">
            {row?.toDate}
          </StatTile>
          <StatTile label="Season total" title="Storms in the whole season">
            {row?.total}
          </StatTile>
          <StatTile label="Season done" title="Share of the season already past by this day">
            {Math.round(share * 100)}%
          </StatTile>
        </div>

        {/* The bar splits at the chosen date, so a month straddling it reads at a glance. */}
        <ComparisonBarList
          heading="Storms by month, solid up to this day:"
          emptyText="This season produced no storms."
          rows={rows}
        />
      </div>
    </DefModal>
  );
};

export default SeasonMonthsModal;
