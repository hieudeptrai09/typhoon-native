import ComparisonBarList, {
  type ComparisonBarRow,
} from "@/lib/components/common/ComparisonBarList";
import DefModal from "@/lib/components/common/DefModal";
import StatTile from "@/lib/components/common/StatTile";
import { MONTH_NAMES, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { formatOrdinalDate, formatStormDateRange } from "@/lib/utils/date";
import { getSeasonMonths, hasStartedBy, type SeasonToDateRow } from "@/lib/utils/storm/calendar";
import { StyleSheet, Text, View } from "react-native";

interface SeasonMonthsModalProps extends BaseModalProps {
  row: SeasonToDateRow | null;
  monthDay: string;
}

const SeasonMonthsModal = ({ isOpen, onClose, row, monthDay }: SeasonMonthsModalProps) => {
  const months = row ? getSeasonMonths(row.storms, monthDay) : [];
  const share = row && row.total > 0 ? row.toDate / row.total : 0;

  const rows: ComparisonBarRow[] = months.map((month) => {
    const total = month.storms.length;

    return {
      key: String(month.month),
      label: MONTH_NAMES[month.month],
      color: getAvgDateColor(month.month),
      count: total,
      filled: month.toDate,
      valueLabel: month.toDate === total ? String(total) : `${month.toDate} of ${total}`,
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
                {!hasStartedBy(storm, monthDay) ? " · after this day" : ""}
              </Text>
            </Text>
          ))}
        </>
      ),
    };
  });

  return (
    <DefModal
      open={isOpen && row !== null}
      onClose={onClose}
      title={
        <Text style={styles.title} numberOfLines={1}>
          {row ? formatOrdinalDate(monthDay, row.year) : ""}
        </Text>
      }
    >
      <View style={styles.tiles}>
        <View style={styles.tile}>
          <StatTile label="By this day" hint="Storms the season had produced by the chosen date">
            {row?.toDate}
          </StatTile>
        </View>
        <View style={styles.tile}>
          <StatTile label="Season total" hint="Storms in the whole season">
            {row?.total}
          </StatTile>
        </View>
        <View style={styles.tile}>
          <StatTile label="Season done" hint="Share of the season already past by this day">
            {Math.round(share * 100)}%
          </StatTile>
        </View>
      </View>

      <ComparisonBarList
        heading="Storms by month, solid up to this day:"
        emptyText="This season produced no storms."
        rows={rows}
      />
    </DefModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 20,
    color: COLOR.accent,
  },
  tiles: {
    flexDirection: "row",
    gap: 8,
  },
  tile: {
    flex: 1,
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
