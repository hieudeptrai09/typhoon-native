import DefModal from "@/lib/components/common/DefModal";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps, Storm } from "@/lib/types";
import { getDistanceColor } from "@/lib/utils/colors";
import { formatStormDateRange } from "@/lib/utils/date";
import { formatDistance } from "@/lib/utils/storm/aggregate";
import { StyleSheet, Text, View } from "react-native";

interface DistanceModalProps extends BaseModalProps {
  title: string;
  storms: Storm[];
  average: number;
}

const formatGapLabel = (gap: number): string => {
  if (gap === 0) return "same year";
  return gap === 1 ? "1 year" : `${gap} years`;
};

const DistanceModal = ({ isOpen, onClose, title, storms, average }: DistanceModalProps) => {
  const timeline = [...storms].sort((a, b) => a.year - b.year);
  const averageColor = getDistanceColor(average);

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      title={
        <Text style={[styles.title, { color: averageColor }]} numberOfLines={1}>
          {title}
        </Text>
      }
    >
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Average Recurrence: </Text>
        <Text style={[styles.summaryValue, { color: averageColor }]}>
          {formatDistance(average)}
        </Text>
        {average >= 0 && <Text style={styles.summaryLabel}> years</Text>}
      </View>

      <Text style={styles.caption}>
        {timeline.length === 1
          ? "Only one storm, so no recurrence can be measured:"
          : "Storm timeline:"}
      </Text>

      {timeline.length === 0 ? (
        <Text style={styles.empty}>No storms to show.</Text>
      ) : (
        <View>
          {timeline.map((storm, index) => {
            // The first storm has no earlier storm to measure against, which is
            // the same -1 "no gap" case the grid uses for a single storm.
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
      )}
    </DefModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
  },
  summary: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  summaryLabel: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
  },
  summaryValue: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    fontVariant: ["tabular-nums"],
  },
  caption: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
    marginTop: 12,
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

export default DistanceModal;
