import ComparisonBarList, {
  type ComparisonBarRow,
} from "@/lib/components/common/ComparisonBarList";
import { MONTH_NAMES } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { formatStormDateRange, parseStormDate } from "@/lib/utils/date";
import { StyleSheet, Text } from "react-native";

interface SeasonDatesBreakdownProps {
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

const SeasonDatesBreakdown = ({ storms }: SeasonDatesBreakdownProps) => {
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
    <ComparisonBarList
      heading="Storms by start month:"
      emptyText="No storms to show."
      rows={rows}
    />
  );
};

const styles = StyleSheet.create({
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

export default SeasonDatesBreakdown;
