import CountryFlag from "@/lib/components/common/CountryFlag";
import StaleBanner from "@/lib/components/common/StaleBanner";
import GroupedStormList, { type StormGroup } from "@/lib/components/storm/GroupedStormList";
import StatisticsSection from "@/lib/components/storm/StatisticsSection";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, HIT_SIZE, RADIUS, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { getCountryPositionGroups } from "@/lib/utils/country";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import { calculateAverage, getIntensityFromNumber } from "@/lib/utils/storm/aggregate";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CountryPageContentProps {
  country: string;
  storms: Storm[];
  staleError?: boolean;
}

export default function CountryPageContent({
  country,
  storms,
  staleError = false,
}: CountryPageContentProps) {
  const router = useRouter();

  const positionGroups = useMemo(
    () => getCountryPositionGroups(storms, country),
    [storms, country],
  );

  const groups = useMemo<StormGroup[]>(
    () =>
      positionGroups
        .filter(([, positionStorms]) => positionStorms.length > 0)
        .map(([position, positionStorms]) => ({
          key: String(position),
          label: getPositionTitle(position),
          storms: positionStorms,
          onOpen: () => router.push(`/positions/${getPositionSlug(position)}`),
          openLabel: `Open position ${getPositionTitle(position)}`,
        })),
    [positionGroups, router],
  );

  const titleColor =
    storms.length > 0
      ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))]
      : COLOR.textMuted;

  const header = (
    <View style={styles.header}>
      <View style={styles.heading}>
        <CountryFlag country={country} size={28} />
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {country}
        </Text>
      </View>

      <View style={styles.chips} accessibilityLabel="Positions">
        {positionGroups.map(([position, positionStorms]) => (
          <Pressable
            key={position}
            onPress={() => router.push(`/positions/${getPositionSlug(position)}`)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={`Position ${getPositionTitle(position)}, ${positionStorms.length} storms`}
          >
            <Text style={styles.chipLabel}>{getPositionTitle(position)}</Text>
            <Text style={styles.chipCount}>{positionStorms.length}</Text>
          </Pressable>
        ))}
      </View>

      <StatisticsSection storms={storms} showGap={false} />

      <Text style={styles.listTitle}>All Storms ({storms.length})</Text>

      {storms.length === 0 && (
        <Text style={styles.empty}>No storms recorded for this country&apos;s names.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      {staleError && <StaleBanner />}

      <GroupedStormList groups={groups} header={header} showRecurrence={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    gap: SPACE.lg,
    paddingBottom: SPACE.lg,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm + 2,
  },
  title: {
    flexShrink: 1,
    fontFamily: "OpenSans_700Bold",
    fontSize: 28,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: HIT_SIZE - 8,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
  },
  pressed: {
    backgroundColor: COLOR.accentSoft,
  },
  chipLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.textSecondary,
  },
  chipCount: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
  listTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.textSecondary,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
    textAlign: "center",
    paddingVertical: SPACE.md,
  },
});
