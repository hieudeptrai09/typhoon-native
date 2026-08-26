import ComparisonBarList, {
  type ComparisonBarRow,
} from "@/lib/components/common/ComparisonBarList";
import DefModal from "@/lib/components/common/DefModal";
import OpenDetailButton, { type DetailTarget } from "@/lib/components/common/OpenDetailButton";
import StatTile from "@/lib/components/common/StatTile";
import { MONTH_NAMES } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps, Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { formatStormDateRange, parseStormDate } from "@/lib/utils/date";
import {
  calculateAvgDates,
  calculateAvgDuration,
  formatDayOfYear,
  formatDuration,
  getDoyMonth,
} from "@/lib/utils/storm/dates";
import { StyleSheet, Text, View } from "react-native";

interface AvgDateModalProps extends BaseModalProps {
  title: string;
  storms: Storm[];
  target?: DetailTarget;
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

const AvgDateModal = ({ isOpen, onClose, title, storms, target }: AvgDateModalProps) => {
  const { startDoy, endDoy } = calculateAvgDates(storms);
  const avgDuration = calculateAvgDuration(storms);
  const rows: ComparisonBarRow[] = groupByStartMonth(storms).map((group) => ({
    key: group.label,
    label: group.label,
    color: getAvgDateColor(group.month),
    count: group.count,
    details: (
      <>
        {group.storms.map((storm) => (
          <Text key={`${storm.name}-${storm.year}`} style={styles.storm}>
            <Text style={styles.stormName}>{storm.name}</Text> {storm.year}
            <Text style={styles.stormDates}>
              {" · "}
              {formatStormDateRange(storm.dateStart, storm.dateEnd)}
            </Text>
          </Text>
        ))}
      </>
    ),
  }));

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      title={
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      }
      footer={target ? <OpenDetailButton target={target} onClose={onClose} /> : undefined}
    >
      <View style={styles.tiles}>
        <View style={styles.tile}>
          <StatTile label="Avg. Start" hint="Average start date">
            <Text style={{ color: getAvgDateColor(getDoyMonth(startDoy)) }}>
              {formatDayOfYear(startDoy)}
            </Text>
          </StatTile>
        </View>
        <View style={styles.tile}>
          <StatTile label="Avg. End" hint="Average end date">
            <Text style={{ color: getAvgDateColor(getDoyMonth(endDoy)) }}>
              {formatDayOfYear(endDoy)}
            </Text>
          </StatTile>
        </View>
        <View style={styles.tile}>
          <StatTile label="Avg. Duration" hint="Average days from start to end">
            <Text style={styles.duration}>{formatDuration(avgDuration)}</Text>
          </StatTile>
        </View>
      </View>

      <ComparisonBarList
        heading="Storms by start month:"
        emptyText="No storms to show."
        rows={rows}
      />
    </DefModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
    color: COLOR.accent,
  },
  tiles: {
    flexDirection: "row",
    gap: 8,
  },
  tile: {
    flex: 1,
  },
  duration: {
    color: COLOR.textSecondary,
  },
  storm: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textBody,
  },
  stormName: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.accent,
  },
  stormDates: {
    fontSize: 11,
    color: COLOR.textMuted,
  },
});

export default AvgDateModal;
