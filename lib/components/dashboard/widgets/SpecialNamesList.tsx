import { SPECIAL_POSITIONS } from "@/lib/constants";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { sortNamesByFirstYear } from "@/lib/utils/storm/aggregate";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useMemo, useState, type ReactNode } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

interface SpecialNamesListProps {
  stormsData: Storm[];
  onNameClick: (name: string) => void;
  nameColors?: Record<string, string>;
  nameSubtitles?: Record<string, ReactNode>;
}

// CPHC, NHC and IMD name storms outside the naming table, so they have no cell on the grid.
const SpecialNamesList = ({
  stormsData,
  onNameClick,
  nameColors,
  nameSubtitles,
}: SpecialNamesListProps) => {
  const [expanded, setExpanded] = useState(false);
  const { height } = useWindowDimensions();

  const regions = useMemo(
    () =>
      SPECIAL_POSITIONS.map(({ id, label }) => {
        const grouped = stormsData.reduce<Record<string, Storm[]>>((acc, storm) => {
          if (storm.position === id) (acc[storm.name] ??= []).push(storm);
          return acc;
        }, {});

        return {
          id,
          label,
          names: sortNamesByFirstYear(Object.entries(grouped)).map(([name]) => name),
        };
      }),
    [stormsData],
  );

  const total = regions.reduce((sum, region) => sum + region.names.length, 0);
  if (total === 0) return null;

  const toggle = () => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => !current);
  };

  return (
    <View style={styles.root}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Other regions, ${total} name${total === 1 ? "" : "s"}`}
      >
        <Text style={styles.heading}>Other Regions</Text>
        <Text style={styles.count}>{total}</Text>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-up"}
          size={16}
          color={COLOR.textMuted}
        />
      </Pressable>

      {/* Capped and scrolled internally: many names would otherwise push the whole stack past
          the bottom of the screen. */}
      {expanded && (
        <ScrollView
          style={[styles.card, { maxHeight: height * 0.32 }]}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {regions.map(({ id, label, names }, index) => (
            <View key={id} style={[styles.row, index > 0 && styles.rowDivided]}>
              <Text style={styles.rowLabel}>{label}</Text>

              {names.length === 0 ? (
                <Text style={styles.empty}>—</Text>
              ) : (
                <View style={styles.chips}>
                  {names.map((name) => (
                    <Pressable
                      key={name}
                      onPress={() => {
                        Haptics.selectionAsync();
                        onNameClick(name);
                      }}
                      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`${name}, ${label} region`}
                    >
                      <Text
                        style={[
                          styles.chipName,
                          { color: nameColors?.[name] ?? COLOR.textSecondary },
                        ]}
                      >
                        {name}
                      </Text>
                      {nameSubtitles?.[name] !== undefined && (
                        <Text style={styles.subtitle}>{nameSubtitles[name]}</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexShrink: 1,
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingBottom: SPACE.md,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    minHeight: 32,
  },
  pressed: {
    opacity: 0.6,
  },
  heading: {
    flex: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.textMuted,
  },
  count: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.textFaint,
    fontVariant: ["tabular-nums"],
  },
  card: {
    flexGrow: 0,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
    overflow: "hidden",
  },
  cardContent: {
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 44,
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.md,
    gap: SPACE.sm,
  },
  rowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.border,
  },
  // Fixed, and nudged down onto the first row of chips so the agencies line up into a column.
  rowLabel: {
    width: 34,
    paddingTop: 9,
    fontFamily: "OpenSans_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
    color: COLOR.textMuted,
  },
  chips: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.surfaceMuted,
  },
  chipPressed: {
    backgroundColor: COLOR.surfaceSunken,
  },
  chipName: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
  },
  subtitle: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 11,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
  empty: {
    paddingTop: 9,
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textFaint,
  },
});

export default SpecialNamesList;
