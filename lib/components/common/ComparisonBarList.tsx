import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useState, type ReactNode } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

const BAR_MAX = 96;
const BAR_MIN = 8;

export interface ComparisonBarRow {
  key: string;
  label: string;
  labelColor?: string;
  color: string;
  count: number;
  /** Portion of the bar drawn solid; the rest stays as a tint. Defaults to the whole bar. */
  filled?: number;
  valueLabel?: string;
  details: ReactNode;
}

interface ComparisonBarListProps {
  heading: string;
  emptyText: string;
  rows: ComparisonBarRow[];
}

/** Groups whose bars compare their sizes against the largest group, each opening onto its members. */
const ComparisonBarList = ({ heading, emptyText, rows }: ComparisonBarListProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0);

  const toggle = (key: string) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => (current === key ? null : key));
  };

  return (
    <View>
      <Text style={styles.heading}>{heading}</Text>

      {rows.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        <View style={styles.groups}>
          {rows.map((row) => {
            const width =
              maxCount > 0 ? Math.max(BAR_MIN, (row.count / maxCount) * BAR_MAX) : BAR_MIN;
            const filled = row.filled ?? row.count;
            const isExpanded = expanded === row.key;

            return (
              <View key={row.key}>
                <Pressable
                  onPress={() => toggle(row.key)}
                  style={({ pressed }) => [
                    styles.group,
                    { borderLeftColor: row.color },
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                  accessibilityLabel={`${row.label}, ${row.valueLabel ?? row.count}`}
                >
                  <Text
                    style={[styles.groupLabel, row.labelColor ? { color: row.labelColor } : null]}
                    numberOfLines={1}
                  >
                    {row.label}
                  </Text>

                  <View style={styles.groupStats}>
                    {/* The track carries the full count; the fill inside it carries `filled`, so a
                        part-way group reads as one bar rather than two. */}
                    <View style={[styles.track, { width, backgroundColor: `${row.color}40` }]}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${row.count > 0 ? (filled / row.count) * 100 : 0}%`,
                            backgroundColor: row.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.count}>{row.valueLabel ?? row.count}</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={COLOR.textFaint}
                    />
                  </View>
                </Pressable>

                {isExpanded && <View style={styles.details}>{row.details}</View>}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
  count: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textBody,
    fontVariant: ["tabular-nums"],
  },
  details: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
});

export default ComparisonBarList;
