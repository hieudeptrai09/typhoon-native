import { SPECIAL_POSITIONS } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { sortNamesByFirstYear } from "@/lib/utils/storm/aggregate";
import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
      {/* Capped: these three agencies hold enough crossover names to squeeze the country pager
          above into nothing if this block is left to grow. */}
      <ScrollView style={styles.scroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        <View style={styles.columns}>
          {stormsByPosition.map(({ id, label, names }) => (
            <View key={id} style={styles.column}>
              <Text style={styles.columnLabel}>{label}</Text>
              <View style={styles.box}>
                {names.length === 0 ? (
                  <Text style={styles.empty}>—</Text>
                ) : (
                  names.map(({ name, color, storms }) => (
                    <Pressable
                      key={name}
                      onPress={() => {
                        Haptics.selectionAsync();
                        onNameClick(name, storms);
                      }}
                      style={({ pressed }) => [styles.name, pressed && styles.pressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`${name}, ${label} region`}
                    >
                      <Text style={[styles.nameLabel, { color }]} numberOfLines={1}>
                        {name}
                      </Text>
                      {nameSubtitles?.[name] !== undefined && (
                        <Text style={styles.subtitle}>{nameSubtitles[name]}</Text>
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingBottom: SPACE.md,
  },
  scroll: {
    flexGrow: 0,
    maxHeight: 220,
  },
  heading: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.textMuted,
  },
  columns: {
    flexDirection: "row",
    gap: 8,
  },
  column: {
    flex: 1,
    gap: 4,
  },
  columnLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
    color: COLOR.textMuted,
    textAlign: "center",
  },
  box: {
    flex: 1,
    gap: 2,
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textFaint,
    textAlign: "center",
    paddingVertical: 8,
  },
  name: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  nameLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
  },
  subtitle: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 10,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
});

export default SpecialNamesList;
