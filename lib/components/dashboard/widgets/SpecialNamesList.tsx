import EdgeFade from "@/lib/components/common/EdgeFade";
import { SPECIAL_POSITIONS } from "@/lib/constants";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { sortNamesByFirstYear } from "@/lib/utils/storm/aggregate";
import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SpecialNamesListProps {
  stormsData: Storm[];
  onNameClick: (name: string, storms: Storm[]) => void;
  nameColors?: Record<string, string>;
  nameSubtitles?: Record<string, ReactNode>;
}

const SpecialNamesList = ({
  stormsData,
  onNameClick,
  nameColors,
  nameSubtitles,
}: SpecialNamesListProps) => {
  const stormsByPosition = SPECIAL_POSITIONS.map(({ id, label }) => {
    const positionStorms = stormsData.filter((storm) => storm.position === id);

    const nameMap = positionStorms.reduce<Record<string, Storm[]>>((acc, storm) => {
      if (!acc[storm.name]) acc[storm.name] = [];
      acc[storm.name].push(storm);
      return acc;
    }, {});

    const names = sortNamesByFirstYear(Object.entries(nameMap)).map(([name, nameStorms]) => ({
      name,
      color: nameColors?.[name] ?? COLOR.textSecondary,
      storms: nameStorms,
    }));

    return { id, label, names };
  });

  if (stormsByPosition.every((position) => position.names.length === 0)) return null;

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Other Regions</Text>

      <View style={styles.card}>
        {stormsByPosition.map(({ id, label, names }, index) => (
          <View key={id} style={[styles.row, index > 0 && styles.rowDivided]}>
            <Text style={styles.rowLabel}>{label}</Text>

            {names.length === 0 ? (
              <Text style={styles.empty}>—</Text>
            ) : (
              <EdgeFade
                style={styles.chipRow}
                contentContainerStyle={styles.chips}
                backgroundColor={COLOR.surface}
                accessibilityLabel={`${label} region names`}
              >
                {names.map(({ name, color, storms }) => (
                  <Pressable
                    key={name}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onNameClick(name, storms);
                    }}
                    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`${name}, ${label} region`}
                  >
                    <Text style={[styles.chipName, { color }]}>{name}</Text>
                    {nameSubtitles?.[name] !== undefined && (
                      <Text style={styles.subtitle}>{nameSubtitles[name]}</Text>
                    )}
                  </Pressable>
                ))}
              </EdgeFade>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingBottom: SPACE.md,
  },
  heading: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.textMuted,
  },
  card: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingLeft: SPACE.md,
  },
  rowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.border,
  },
  // Fixed, so the names of all three agencies line up into a column of their own.
  rowLabel: {
    width: 42,
    fontFamily: "OpenSans_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
    color: COLOR.textMuted,
  },
  chipRow: {
    flex: 1,
  },
  chips: {
    alignItems: "center",
    gap: 6,
    paddingRight: SPACE.md,
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
  pressed: {
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
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textFaint,
  },
});

export default SpecialNamesList;
