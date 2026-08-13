import CountryFlag from "@/lib/components/common/CountryFlag";
import EmptyResults from "@/lib/components/common/EmptyResults";
import ImageCredit from "@/lib/components/common/ImageCredit";
import { useRefreshControl } from "@/lib/components/common/RefreshContext";
import Section from "@/lib/components/common/Section";
import StaleBanner from "@/lib/components/common/StaleBanner";
import ZoomableImage from "@/lib/components/common/ZoomableImage";
import StormCard from "@/lib/components/storm/StormCard";
import StormStats from "@/lib/components/storm/StormStats";
import { BACKGROUND_BADGE, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { GRID_MAX } from "@/lib/constants/position";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { PositionDetail, RetiredName, Storm, TyphoonName } from "@/lib/types";
import { getDistanceColor, getNameStatusColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getGroupedStorms,
  getIntensityFromNumber,
  sortNamesByFirstYear,
} from "@/lib/utils/storm/aggregate";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PositionPageContentProps {
  detail: PositionDetail | null;
  position: number;
  /** A refresh failed over data already on screen — worth saying, not worth a full error page. */
  staleError?: boolean;
}

interface StormGroup {
  name: string;
  data: Storm[];
  count: number;
  average: number;
  recurrence: number;
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

  // The whole row navigates, rather than the name being a text-sized link inside it: at 17px a
  // word is a ~24pt target, well under what a thumb can hit.
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
            <ZoomableImage
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
  const refreshControl = useRefreshControl();
  const insets = useSafeAreaInsets();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const storms = useMemo(() => detail?.storms ?? [], [detail]);

  const groups = useMemo<StormGroup[]>(
    () =>
      sortNamesByFirstYear(Object.entries(getGroupedStorms(storms, "name"))).map(
        ([name, group]) => {
          const sorted = [...group].sort((a, b) => a.year - b.year);
          return {
            name,
            data: sorted,
            count: sorted.length,
            average: calculateAverage(sorted),
            recurrence: calculateGapAverage(sorted),
          };
        },
      ),
    [storms],
  );

  const sections = useMemo(
    () => groups.map((group) => ({ ...group, data: collapsed[group.name] ? [] : group.data })),
    [groups, collapsed],
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

  const toggle = (name: string) => {
    Haptics.selectionAsync();
    setCollapsed((current) => ({ ...current, [name]: !current[name] }));
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.heading}>
        {isInGrid && <CountryFlag country={country} size={22} />}
        <Text style={[styles.title, { color: titleColor }]}>{getPositionTitle(position)}</Text>
        {isInGrid && (
          <Text style={styles.country} numberOfLines={1}>
            {country}
          </Text>
        )}
      </View>

      {isInGrid && <NameTimeline names={names} storms={storms} />}

      <Text style={styles.listTitle}>All Storms ({storms.length})</Text>

      {storms.length > 0 ? (
        <StormStats storms={storms} />
      ) : (
        <Text style={styles.empty}>No storms recorded at this position.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      {staleError && <StaleBanner />}

      <SectionList<Storm, StormGroup>
        sections={sections}
        keyExtractor={(storm, index) => `${storm.name}-${storm.year}-${index}`}
        // One card per row: a track map at half a phone's width is unreadable.
        renderItem={({ item }) => (
          <View style={styles.card}>
            <StormCard storm={item} />
          </View>
        )}
        renderSectionHeader={({ section: group }) => {
          const intensityLabel = getIntensityFromNumber(group.average);
          const isCollapsed = Boolean(collapsed[group.name]);

          return (
            <View style={styles.groupHeaderWrap}>
              <Pressable
                onPress={() => toggle(group.name)}
                style={({ pressed }) => [
                  styles.groupHeader,
                  { borderLeftColor: BACKGROUND_BADGE[intensityLabel] },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ expanded: !isCollapsed }}
                accessibilityLabel={`${group.name}, ${group.count} storms`}
              >
                <View style={styles.groupBody}>
                  <Text style={styles.groupName}>{group.name}</Text>

                  <View style={styles.groupStats}>
                    <Text style={styles.stat}>
                      Count: <Text style={styles.statValue}>{group.count}</Text>
                    </Text>
                    <Text style={styles.stat}>
                      Avg:{" "}
                      <Text
                        style={[
                          styles.statValue,
                          { color: TEXT_COLOR_WHITE_BACKGROUND[intensityLabel] },
                        ]}
                      >
                        {group.average.toFixed(2)}
                      </Text>
                    </Text>
                    {/* A lone storm leaves no gap to measure, so the stat is left off entirely. */}
                    {group.recurrence >= 0 && (
                      <Text style={styles.stat}>
                        Every:{" "}
                        <Text
                          style={[styles.statValue, { color: getDistanceColor(group.recurrence) }]}
                        >
                          {formatDistance(group.recurrence)}
                        </Text>{" "}
                        yrs
                      </Text>
                    )}
                  </View>
                </View>

                <Ionicons
                  name={isCollapsed ? "chevron-down" : "chevron-up"}
                  size={18}
                  color={COLOR.textMuted}
                />
              </Pressable>
            </View>
          );
        }}
        ListHeaderComponent={header}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACE.xl }]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        // Every card carries a remote track map, and a long-lived position runs to dozens of them.
        initialNumToRender={4}
        windowSize={7}
        removeClippedSubviews
      />
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
  content: {
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.lg,
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
  country: {
    flexShrink: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: COLOR.textBody,
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
  // The rail is the dot column itself: a phone is too narrow to spare a separate spine and indent.
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
  // Opaque and full-bleed, so cards scrolling under the pinned header stay hidden.
  groupHeaderWrap: {
    paddingBottom: SPACE.md,
    backgroundColor: COLOR.background,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    minHeight: 56,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
  },
  groupBody: {
    flex: 1,
    gap: SPACE.xs,
  },
  pressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  groupName: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textSecondary,
  },
  groupStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: SPACE.md,
    rowGap: 2,
  },
  stat: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textBody,
  },
  statValue: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textSecondary,
  },
  card: {
    paddingBottom: SPACE.lg,
  },
});
