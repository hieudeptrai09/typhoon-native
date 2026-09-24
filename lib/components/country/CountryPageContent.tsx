import CountryFlag from "@/lib/components/common/CountryFlag";
import StaleBanner from "@/lib/components/common/StaleBanner";
import StatisticsSection from "@/lib/components/storm/StatisticsSection";
import StormNameList from "@/lib/components/storm/StormNameList";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { RetiredName, Storm } from "@/lib/types";
import { calculateAverage, getIntensityFromNumber } from "@/lib/utils/storm/aggregate";
import { StyleSheet, Text, View } from "react-native";

interface CountryPageContentProps {
  country: string;
  storms: Storm[];
  names: RetiredName[];
  staleError?: boolean;
}

export default function CountryPageContent({
  country,
  storms,
  names,
  staleError = false,
}: CountryPageContentProps) {
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

      <StatisticsSection storms={storms} showGap={false} />
    </View>
  );

  return (
    <View style={styles.root}>
      {staleError && <StaleBanner />}

      {/* Every row is this country, so its flag would only repeat the screen title. */}
      <StormNameList
        storms={storms}
        names={names}
        header={header}
        empty={<Text style={styles.empty}>No storms recorded for this country&apos;s names.</Text>}
        showCountry={false}
      />
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
    alignItems: "center",
    gap: SPACE.sm + 2,
  },
  title: {
    flexShrink: 1,
    fontFamily: "OpenSans_700Bold",
    fontSize: 28,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
    textAlign: "center",
    paddingVertical: SPACE.md,
  },
});
