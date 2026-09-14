import CountryFlag from "@/lib/components/common/CountryFlag";
import EmptyResults from "@/lib/components/common/EmptyResults";
import ImageCredit from "@/lib/components/common/ImageCredit";
import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import Section from "@/lib/components/common/Section";
import StaleBanner from "@/lib/components/common/StaleBanner";
import GroupedStormList, { type StormGroup } from "@/lib/components/storm/GroupedStormList";
import StatisticsSection from "@/lib/components/storm/StatisticsSection";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { GRID_MAX } from "@/lib/constants/position";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { PositionDetail, RetiredName, Storm, TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { getCountrySlug, isKnownCountry } from "@/lib/utils/country";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  getGroupedStorms,
  getIntensityFromNumber,
  sortNamesByFirstYear,
} from "@/lib/utils/storm/aggregate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface PositionPageContentProps {
  detail: PositionDetail | null;
  position: number;
  staleError?: boolean;
}

function NameTimelineItem({ name, storms }: { name: TyphoonName | RetiredName; storms: Storm[] }) {
  const router = useRouter();

  const years = storms.map((storm) => storm.year);
  const firstYear = years.length > 0 ? Math.min(...years) : undefined;
  const lastStormYear = years.length > 0 ? Math.max(...years) : undefined;
  const retiredYear = "lastYear" in name && name.lastYear ? name.lastYear : lastStormYear;
  const replacementName =
    "replacementName" in name && name.replacementName ? name.replacementName : undefined;
  const note = "note" in name && name.note ? name.note : undefined;
  const isSucceeded = name.isRetired || Boolean(replacementName);
  const statusColor = getNameStatusColor(name);

  let era: string;
  if (firstYear === undefined) {
    era = isSucceeded ? "Never used" : "Awaiting first storm";
  } else if (isSucceeded) {
    era = firstYear === retiredYear ? `${firstYear}` : `${firstYear} – ${retiredYear}`;
  } else {
    era = `${firstYear} – present`;
  }

  // The whole row navigates rather than the name inside it: at 17px a word is a ~24pt target.
  return (
    <Pressable
      onPress={() => router.push(`/info/${name.name.toLowerCase()}`)}
      style={({ pressed }) => [styles.timelineItem, pressed && styles.timelineItemPressed]}
      android_ripple={{ color: COLOR.accentSoft }}
      accessibilityRole="link"
      accessibilityLabel={`${name.name}, ${era}. Open name.`}
    >
      <View style={[styles.timelineDot, { backgroundColor: statusColor }]} />

      <View style={styles.timelineBody}>
        <Text style={styles.era}>{era}</Text>

        <View style={styles.nameLine}>
          <Text style={[styles.name, { color: statusColor }]}>{name.name}</Text>
          {name.originalText ? <Text style={styles.original}>{name.originalText}</Text> : null}
          {name.language ? <Text style={styles.language}>· {name.language}</Text> : null}
        </View>

        {name.meaning ? <Text style={styles.meaning}>{name.meaning}</Text> : null}

        {/* The era above already ends at the retirement year, so it isn't repeated here. */}
        {isSucceeded && (
          <Text style={[styles.succeeded, { color: statusColor }]}>
            {name.isRetired ? "Retired" : "Replaced"}
          </Text>
        )}
        {note ? <Text style={styles.note}>{note}</Text> : null}

        {name.image ? (
          <View style={styles.timelineImageBlock}>
            <ImageWithLoader
              source={name.image}
              label={name.name}
              style={styles.timelineImage}
              spinnerSize="small"
              credit={name.imageCredit}
            />
            <ImageCredit credit={name.imageCredit} align="end" />
          </View>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
    </Pressable>
  );
}

function NameTimeline({ names, storms }: { names: TyphoonName[]; storms: Storm[] }) {
  const stormsByName: Record<string, Storm[]> = {};
  storms.forEach((storm) => {
    if (!stormsByName[storm.name]) stormsByName[storm.name] = [];
    stormsByName[storm.name].push(storm);
  });

  const sortKey = (name: TyphoonName | RetiredName) => {
    const years = (stormsByName[name.name] || []).map((storm) => storm.year);
    if (years.length > 0) return Math.min(...years);
    if ("lastYear" in name && name.lastYear) return name.lastYear;
    return Infinity;
  };
  const sortedNames = [...names].sort((a, b) => sortKey(a) - sortKey(b));

  return (
    <Section title={`Name Timeline (${names.length})`}>
      {names.length === 0 ? (
        <Text style={styles.empty}>No names have been assigned to this slot.</Text>
      ) : (
        <View style={styles.timeline}>
          {sortedNames.map((name) => (
            <NameTimelineItem key={name.id} name={name} storms={stormsByName[name.name] || []} />
          ))}
        </View>
      )}
    </Section>
  );
}

export default function PositionPageContent({
  detail,
  position,
  staleError = false,
}: PositionPageContentProps) {
  const router = useRouter();

  const storms = useMemo(() => detail?.storms ?? [], [detail]);

  const groups = useMemo<StormGroup[]>(
    () =>
      sortNamesByFirstYear(Object.entries(getGroupedStorms(storms, "name"))).map(
        ([name, group]) => ({
          key: name,
          label: name,
          storms: [...group].sort((a, b) => a.year - b.year),
        }),
      ),
    [storms],
  );

  if (!detail || (detail.names.length === 0 && storms.length === 0)) {
    return (
      <View style={styles.state}>
        <EmptyResults icon="search-outline" description="No data recorded for this position yet." />
      </View>
    );
  }

  const { country, names } = detail;
  const isInGrid = position <= GRID_MAX;
  const titleColor =
    storms.length > 0
      ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))]
      : COLOR.textMuted;

  const header = (
    <View style={styles.header}>
      <View style={styles.heading}>
        {isInGrid && <CountryFlag country={country} size={22} />}
        <Text style={[styles.title, { color: titleColor }]}>{getPositionTitle(position)}</Text>
        {isInGrid && isKnownCountry(country) && (
          <Pressable
            onPress={() => router.push(`/countries/${getCountrySlug(country)}`)}
            hitSlop={8}
            style={({ pressed }) => [styles.countryLink, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={`Open ${country}`}
          >
            <Text style={styles.country} numberOfLines={1}>
              {country}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={COLOR.accent} />
          </Pressable>
        )}
      </View>

      {isInGrid && <NameTimeline names={names} storms={storms} />}

      <StatisticsSection storms={storms} />

      <Text style={styles.listTitle}>All Storms ({storms.length})</Text>

      {storms.length === 0 && (
        <Text style={styles.empty}>No storms recorded at this position.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      {staleError && <StaleBanner />}

      <GroupedStormList groups={groups} header={header} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  state: {
    flex: 1,
    justifyContent: "center",
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
    fontFamily: "OpenSans_700Bold",
    fontSize: 28,
  },
  countryLink: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 44,
  },
  country: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.accent,
  },
  pressed: {
    opacity: 0.6,
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
  timeline: {
    gap: SPACE.md,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.md,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.sm,
  },
  timelineItemPressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 5,
    borderWidth: 2,
    borderColor: COLOR.surface,
  },
  timelineBody: {
    flex: 1,
    gap: 2,
  },
  era: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLOR.textMuted,
  },
  nameLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: SPACE.sm,
    rowGap: 2,
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
  },
  original: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: COLOR.textBody,
  },
  language: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  meaning: {
    fontFamily: "OpenSans_400Regular_Italic",
    fontSize: 14,
    lineHeight: 20,
    color: COLOR.textBody,
  },
  succeeded: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    marginTop: SPACE.xs,
  },
  note: {
    fontFamily: "OpenSans_400Regular_Italic",
    fontSize: 12,
    lineHeight: 18,
    color: COLOR.textMuted,
  },
  timelineImageBlock: {
    width: 144,
    marginTop: SPACE.sm,
  },
  timelineImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surfaceSubtle,
  },
});
