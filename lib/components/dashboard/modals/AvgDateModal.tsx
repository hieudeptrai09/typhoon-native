import DefModal from "@/lib/components/common/DefModal";
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
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

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
  // The month rows revealed their storms on hover on web; on touch they expand in place instead.
  const [expanded, setExpanded] = useState<number | null>(null);

  const { startDoy, endDoy } = calculateAvgDates(storms);
  const avgDuration = calculateAvgDuration(storms);
  const monthGroups = groupByStartMonth(storms);
  const maxCount = monthGroups.reduce((max, group) => Math.max(max, group.count), 0);

  const toggle = (month: number) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => (current === month ? null : month));
  };

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      title={
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      }
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

      <Text style={styles.heading}>Storms by start month:</Text>

      {monthGroups.length === 0 ? (
        <Text style={styles.empty}>No storms to show.</Text>
      ) : (
        <View style={styles.groups}>
          {monthGroups.map((group) => {
            const monthColor = getAvgDateColor(group.month);
            const isExpanded = expanded === group.month;

            return (
              <View key={group.label}>
                <Pressable
                  onPress={() => toggle(group.month)}
                  style={({ pressed }) => [
                    styles.group,
                    { borderLeftColor: monthColor },
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                  accessibilityLabel={`${group.label}, ${group.count} storms`}
                >
                  <Text style={styles.groupLabel}>{group.label}</Text>

                  <View style={styles.groupStats}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: maxCount > 0 ? Math.max(8, (group.count / maxCount) * 96) : 8,
                          backgroundColor: monthColor,
                        },
                      ]}
                    />
                    <Text style={styles.count}>{group.count}</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={COLOR.textFaint}
                    />
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.stormList}>
                    {group.storms.map((storm) => (
                      <Text key={`${storm.name}-${storm.year}`} style={styles.storm}>
                        <Text style={styles.stormName}>{storm.name}</Text> {storm.year}
                        <Text style={styles.stormDates}>
                          {" "}
                          · {formatStormDateRange(storm.dateStart, storm.dateEnd)}
                        </Text>
                      </Text>
                    ))}
                  </View>
                )}
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
  heading: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
    marginTop: 16,
    marginBottom: 8,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  groups: {
    gap: 8,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: COLOR.surfaceSubtle,
  },
  pressed: {
    backgroundColor: COLOR.surfaceSunken,
  },
  groupLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.textSecondary,
  },
  groupStats: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  count: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textBody,
    fontVariant: ["tabular-nums"],
  },
  stormList: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
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
