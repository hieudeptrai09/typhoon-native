import ComparisonBarList, {
  type ComparisonBarRow,
} from "@/lib/components/common/ComparisonBarList";
import DefModal from "@/lib/components/common/DefModal";
import type { PaceRow } from "@/lib/components/season/SeasonPaceRow";
import { MONTH_NAMES, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { formatMonthDay, formatStormDateRange } from "@/lib/utils/date";
import { getSeasonMonths, hasStartedBy } from "@/lib/utils/storm/calendar";
import { StyleSheet, Text } from "react-native";

const monthRows = (row: PaceRow, monthDay: string): ComparisonBarRow[] =>
  getSeasonMonths(row.storms, monthDay).map((month) => ({
    key: String(month.month),
    label: MONTH_NAMES[month.month],
    color: getAvgDateColor(month.month),
    count: month.storms.length,
    filled: month.toDate,
    valueLabel:
      month.toDate === month.storms.length
        ? String(month.storms.length)
        : `${month.toDate} of ${month.storms.length}`,
    details: (
      <>
        {month.storms.map((storm, index) => (
          <Text key={`${storm.name}-${index}`} style={styles.storm}>
            <Text
              style={[styles.stormName, { color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }]}
            >
              {storm.name}
            </Text>
            <Text style={styles.stormMeta}>
              {" · "}
              {formatStormDateRange(storm.dateStart, storm.dateEnd)}
              {hasStartedBy(storm, monthDay) ? "" : " · after this day"}
            </Text>
          </Text>
        ))}
      </>
    ),
  }));

interface SeasonMonthsModalProps extends BaseModalProps {
  row: PaceRow | null;
  monthDay: string;
}

const SeasonMonthsModal = ({ isOpen, onClose, row, monthDay }: SeasonMonthsModalProps) => (
  <DefModal
    open={isOpen && row !== null}
    onClose={onClose}
    title={
      <Text style={styles.title} numberOfLines={1}>
        {formatMonthDay(monthDay)} {row?.year}
      </Text>
    }
  >
    <Text style={styles.summary}>
      {row === null
        ? ""
        : row.share === null
          ? `${row.toDate} so far — the season is still running.`
          : `${row.toDate} of ${row.total}, so ${Math.round(row.share * 100)}% of the season was already past by this day.`}
    </Text>

    <ComparisonBarList
      heading="Storms by month, solid up to this day:"
      emptyText="This season produced no storms."
      rows={row === null ? [] : monthRows(row, monthDay)}
    />
  </DefModal>
);

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 20,
    color: COLOR.accent,
  },
  summary: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: COLOR.textBody,
  },
  storm: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textBody,
  },
  stormName: {
    fontFamily: "OpenSans_600SemiBold",
  },
  stormMeta: {
    fontSize: 11,
    color: COLOR.textMuted,
  },
});

export default SeasonMonthsModal;
