import CountryFlag from "@/lib/components/common/CountryFlag";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import ImageCredit from "@/lib/components/common/ImageCredit";
import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import StormCard from "@/lib/components/storm/StormCard";
import StormStats from "@/lib/components/storm/StormStats";
import { BACKGROUND_BADGE, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { PositionDetail, RetiredName, Storm, TyphoonName } from "@/lib/types";
import { getDistanceColor, getNameStatusColor } from "@/lib/utils/colors";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getGroupedStorms,
  getIntensityFromNumber,
  sortNamesByFirstYear,
} from "@/lib/utils/storm/aggregate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface PositionPageContentProps {
  detail: PositionDetail | null;
  position: number;
  isError?: boolean;
}

const TOTAL_POSITIONS = 143;
/** Above this the position belongs to another basin's agency, which has no grid cell or country. */
const LAST_GRID_POSITION = 140;

function PositionPagination({ position }: { position: number }) {
  const router = useRouter();

  const isFirst = position === 1;
  const isLast = position === TOTAL_POSITIONS;
  const prevPosition = isFirst ? TOTAL_POSITIONS : position - 1;
  const nextPosition = isLast ? 1 : position + 1;

  // replace, not push: paging through positions should not build a back stack to unwind.
  const go = (target: number) => router.replace(`/positions/${getPositionSlug(target)}`);

  return (
    <View style={styles.pagination} accessibilityLabel="Position pagination">
      <Pressable
        onPress={() => go(prevPosition)}
        style={({ pressed }) => [
          styles.pageButton,
          // A wrap-around jumps to the far end of the table, so it is toned down to read as such.
          isFirst && styles.pageButtonWrap,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Previous position, ${getPositionTitle(prevPosition)}`}
      >
        <Ionicons name="chevron-back" size={16} color="#ffffff" />
        <Text style={styles.pageLabel}>{getPositionTitle(prevPosition)}</Text>
      </Pressable>

      <Text style={styles.pageCounter}>
        {position} / {TOTAL_POSITIONS}
      </Text>

      <Pressable
        onPress={() => go(nextPosition)}
        style={({ pressed }) => [
          styles.pageButton,
          isLast && styles.pageButtonWrap,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Next position, ${getPositionTitle(nextPosition)}`}
      >
        <Text style={styles.pageLabel}>{getPositionTitle(nextPosition)}</Text>
        <Ionicons name="chevron-forward" size={16} color="#ffffff" />
      </Pressable>
    </View>
  );
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

  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, { backgroundColor: statusColor }]} />

      <View style={styles.timelineBody}>
        <Text style={styles.era}>{era}</Text>

        <View style={styles.nameLine}>
          <Pressable
            onPress={() => router.push(`/info/${name.name.toLowerCase()}`)}
            hitSlop={6}
            accessibilityRole="link"
            accessibilityLabel={`Open ${name.name}`}
          >
            <Text style={[styles.name, { color: statusColor }]}>{name.name}</Text>
          </Pressable>
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
            />
            <ImageCredit credit={name.imageCredit} align="end" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function NamesSection({ names, storms }: { names: TyphoonName[]; storms: Storm[] }) {
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Name Timeline ({names.length})</Text>

      {names.length === 0 ? (
        <Text style={styles.empty}>No names have been assigned to this slot.</Text>
      ) : (
        <View style={styles.timeline}>
          {sortedNames.map((name) => (
            <NameTimelineItem key={name.id} name={name} storms={stormsByName[name.name] || []} />
          ))}
        </View>
      )}
    </View>
  );
}

function StormsSection({ storms }: { storms: Storm[] }) {
  if (storms.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Storms (0)</Text>
        <Text style={styles.empty}>No storms recorded at this position.</Text>
      </View>
    );
  }

  const nameGroups = sortNamesByFirstYear(Object.entries(getGroupedStorms(storms, "name"))).map(
    ([name, group]) => {
      const sorted = [...group].sort((a, b) => a.year - b.year);
      return {
        name,
        storms: sorted,
        average: calculateAverage(sorted),
        count: sorted.length,
        recurrence: calculateGapAverage(sorted),
      };
    },
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>All Storms ({storms.length})</Text>

      <StormStats storms={storms} />

      {nameGroups.map((group) => {
        const intensityLabel = getIntensityFromNumber(group.average);

        return (
          <View key={group.name} style={styles.group}>
            <View
              style={[styles.groupHeader, { borderLeftColor: BACKGROUND_BADGE[intensityLabel] }]}
            >
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
                    <Text style={[styles.statValue, { color: getDistanceColor(group.recurrence) }]}>
                      {formatDistance(group.recurrence)}
                    </Text>{" "}
                    yrs
                  </Text>
                )}
              </View>
            </View>

            {/* One card per row: a track map at half a phone's width is unreadable. */}
            <View style={styles.cards}>
              {group.storms.map((storm, index) => (
                <StormCard key={index} storm={storm} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function PositionPageContent({
  detail,
  position,
  isError = false,
}: PositionPageContentProps) {
  if (isError) {
    return <FrownError />;
  }
  if (!detail || (detail.names.length === 0 && detail.storms.length === 0)) {
    return (
      <EmptyResults icon="search-outline" description="No data recorded for this position yet." />
    );
  }

  const { country, names, storms } = detail;
  const isInGrid = position <= LAST_GRID_POSITION;
  const titleColor =
    storms.length > 0
      ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))]
      : "#64748b";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        {isInGrid && <CountryFlag country={country} size={22} />}
        <Text style={[styles.title, { color: titleColor }]}>{getPositionTitle(position)}</Text>
        {isInGrid && (
          <Text style={styles.country} numberOfLines={1}>
            {country}
          </Text>
        )}
      </View>

      {isInGrid && <NamesSection names={names} storms={storms} />}
      <StormsSection storms={storms} />

      <PositionPagination position={position} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 28,
  },
  country: {
    flexShrink: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: "#475569",
  },
  section: {
    gap: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: "#334155",
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 12,
  },
  timeline: {
    gap: 20,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
  },
  // The rail is the dot column itself: a phone is too narrow to spare a separate spine and indent.
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 3,
    borderWidth: 2,
    borderColor: "#ffffff",
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
    color: "#64748b",
  },
  nameLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: 8,
    rowGap: 2,
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
  },
  original: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: "#475569",
  },
  language: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  meaning: {
    fontFamily: "OpenSans_400Regular_Italic",
    fontSize: 14,
    lineHeight: 20,
    color: "#0d9488",
  },
  succeeded: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    marginTop: 4,
  },
  note: {
    fontFamily: "OpenSans_400Regular_Italic",
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
  },
  timelineImageBlock: {
    width: 144,
    marginTop: 8,
  },
  timelineImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  group: {
    gap: 12,
  },
  groupHeader: {
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: "#f8fafc",
  },
  groupName: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: "#334155",
  },
  groupStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 2,
  },
  stat: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: "#475569",
  },
  statValue: {
    fontFamily: "OpenSans_600SemiBold",
    color: "#334155",
  },
  cards: {
    gap: 16,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#cbd5e1",
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#0369a1",
  },
  pageButtonWrap: {
    backgroundColor: "#6b7280",
  },
  pressed: {
    opacity: 0.8,
  },
  pageLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#ffffff",
  },
  pageCounter: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: "#64748b",
    fontVariant: ["tabular-nums"],
  },
});
