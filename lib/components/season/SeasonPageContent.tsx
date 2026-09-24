import StaleBanner from "@/lib/components/common/StaleBanner";
import SeasonNameChanges from "@/lib/components/season/SeasonNameChanges";
import StatisticsSection from "@/lib/components/storm/StatisticsSection";
import StormNameList from "@/lib/components/storm/StormNameList";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { RetiredName, Storm } from "@/lib/types";
import { calculateAverage, getIntensityFromNumber } from "@/lib/utils/storm/aggregate";
import { StyleSheet, Text, View } from "react-native";

interface SeasonPageContentProps {
  year: number;
  // Already in start-date order.
  storms: Storm[];
  names: RetiredName[];
  // Names whose last season this was.
  retiredNames: RetiredName[];
  // The storms that first carried their name, in start-date order.
  debuts: Storm[];
  staleError?: boolean;
}

export default function SeasonPageContent({
  year,
  storms,
  names,
  retiredNames,
  debuts,
  staleError = false,
}: SeasonPageContentProps) {
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

      {(retiredNames.length > 0 || debuts.length > 0) && (
        <SeasonNameChanges retiredNames={retiredNames} debuts={debuts} />
      )}

      <StatisticsSection storms={storms} showGap={false} />
    </View>
  );

  return (
    <View style={styles.root}>
      {staleError && <StaleBanner />}

      {/* One season is one year, so the year would only repeat the screen title. */}
      <StormNameList storms={storms} names={names} header={header} showYear={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    gap: SPACE.lg,
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
});
