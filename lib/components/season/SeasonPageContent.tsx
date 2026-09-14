import StaleBanner from "@/lib/components/common/StaleBanner";
import GroupedStormList, { type StormGroup } from "@/lib/components/storm/GroupedStormList";
import StatisticsSection from "@/lib/components/storm/StatisticsSection";
import { MONTH_NAMES, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { calculateAverage, getIntensityFromNumber } from "@/lib/utils/storm/aggregate";
import { getSeasonMonthGroups } from "@/lib/utils/storm/dates";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface SeasonPageContentProps {
  year: number;
  // Already in start-date order.
  storms: Storm[];
  staleError?: boolean;
}

export default function SeasonPageContent({
  year,
  storms,
  staleError = false,
}: SeasonPageContentProps) {
  const groups = useMemo<StormGroup[]>(
    () =>
      getSeasonMonthGroups(storms).map(([month, monthStorms], index) => ({
        // A carried-over December and the season's own December are separate runs.
        key: `${month}-${index}`,
        label: MONTH_NAMES[month],
        storms: monthStorms,
      })),
    [storms],
  );

  const titleColor =
    storms.length > 0
      ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))]
      : COLOR.textMuted;

  const header = (
    <View style={styles.header}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: titleColor }]}>{year}</Text>
        <Text style={styles.subtitle}>Typhoon Season</Text>
      </View>

      <StatisticsSection storms={storms} showGap={false} />

      <Text style={styles.listTitle}>All Storms ({storms.length})</Text>
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
    alignItems: "baseline",
    gap: SPACE.sm + 2,
  },
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 28,
    fontVariant: ["tabular-nums"],
  },
  subtitle: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: COLOR.textBody,
  },
  listTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.textSecondary,
  },
});
