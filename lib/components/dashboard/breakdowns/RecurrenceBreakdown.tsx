import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { getDistanceColor } from "@/lib/utils/colors";
import { formatStormDateRange } from "@/lib/utils/date";
import { StyleSheet, Text, View } from "react-native";

interface RecurrenceBreakdownProps {
  storms: Storm[];
}

const formatGapLabel = (gap: number): string => {
  if (gap === 0) return "same year";
  return gap === 1 ? "1 year" : `${gap} years`;
};

const RecurrenceBreakdown = ({ storms }: RecurrenceBreakdownProps) => {
  const timeline = [...storms].sort((a, b) => a.year - b.year);

  if (timeline.length === 0) {
    return <Text style={styles.empty}>No storms to show.</Text>;
  }

  return (
    <View>
      <Text style={styles.caption}>
        {timeline.length === 1
          ? "Only one storm, so no reuse gap can be measured:"
          : "Storm timeline:"}
      </Text>

      {timeline.map((storm, index) => {
        // The first storm has no earlier storm to measure against, which is the same -1 "no gap"
        // case the grid uses for a single storm.
        const gap = index > 0 ? storm.year - timeline[index - 1].year : -1;
        const color = getDistanceColor(gap);

        return (
          <View key={`${storm.name}-${storm.year}-${index}`}>
            {gap >= 0 && (
              <View style={styles.gap}>
                <View style={styles.rail}>
                  <View style={[styles.railLine, { backgroundColor: color }]} />
                </View>
                <Text style={[styles.gapLabel, { color }]}>{formatGapLabel(gap)}</Text>
              </View>
            )}

            <View style={styles.entry}>
              <View style={styles.rail}>
                <View style={[styles.dot, { backgroundColor: color }]} />
              </View>
              <Text style={[styles.year, { color }]}>{storm.year}</Text>
              <Text style={[styles.name, { color }]} numberOfLines={1}>
                {storm.name}
              </Text>
              <Text style={styles.dates} numberOfLines={1}>
                {formatStormDateRange(storm.dateStart, storm.dateEnd)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  caption: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
    marginBottom: 8,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  gap: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  // Fixed-width gutter so the connector line and the dots below it share one axis.
  rail: {
    width: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  railLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
  },
  gapLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    paddingVertical: 4,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  year: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  name: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
  },
  dates: {
    flexShrink: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
});

export default RecurrenceBreakdown;
