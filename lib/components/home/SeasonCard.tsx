import type { QueryState } from "@/lib/api/client";
import HomeCard from "@/lib/components/home/HomeCard";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { getSeasonPaceColor } from "@/lib/utils/colors";
import { formatMonthDay, monthDayOf, parseStormDate, todayISO } from "@/lib/utils/date";
import {
  averageToDate,
  getSeasonToDate,
  isSeasonOngoing,
  NAMING_LIST_FIRST_YEAR,
} from "@/lib/utils/storm/calendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Below this the two seasons are close enough that an arrow would overstate the gap.
const EVEN_THRESHOLD = 0.05;

interface SeasonCardProps {
  query: QueryState<Storm[]>;
}

const PaceBar = ({
  label,
  value,
  display,
  max,
  color,
  isMuted,
}: {
  label: string;
  value: number;
  display: string;
  max: number;
  color: string;
  isMuted?: boolean;
}) => (
  <View style={styles.barRow}>
    <Text style={[styles.barLabel, isMuted && styles.barLabelMuted]}>{label}</Text>
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${max > 0 ? (value / max) * 100 : 0}%`, backgroundColor: color },
        ]}
      />
    </View>
    <Text style={[styles.barValue, isMuted && styles.barValueMuted]}>{display}</Text>
  </View>
);

const SeasonCard = ({ query }: SeasonCardProps) => {
  const { data, isLoading, isError, refetch } = query;

  const season = useMemo(() => {
    if (!data) return null;

    const today = todayISO();
    const monthDay = monthDayOf(today);
    const year = parseStormDate(today).year;
    const rows = getSeasonToDate(data, monthDay);

    if (rows.length === 0) return null;

    // The running season counts toward the average: it has genuinely reached this day, so its
    // toDate is a finished observation. Its `total` is not, which is why averageTotal still drops it.
    const toDate = rows.find((row) => row.year === year)?.toDate ?? 0;
    const average = averageToDate(rows);

    // The record, though, is the mark to beat, so it comes from completed seasons only.
    const past = rows.filter((row) => !isSeasonOngoing(row.year));
    const record = past.length
      ? past.reduce((best, row) => (row.toDate > best.toDate ? row : best))
      : null;

    const footnote = record
      ? toDate > record.toDate
        ? `${year} has passed ${record.year}'s ${record.toDate}, the busiest by this day since ${NAMING_LIST_FIRST_YEAR}.`
        : `Busiest by this day since ${NAMING_LIST_FIRST_YEAR}: ${record.year} with ${record.toDate}`
      : null;

    return { year, monthDay, toDate, average, delta: toDate - average, footnote };
  }, [data]);

  if (!isLoading && !isError && season === null) return null;

  const dateLabel = season ? formatMonthDay(season.monthDay) : "";
  const delta = season?.delta ?? 0;
  const isEven = Math.abs(delta) < EVEN_THRESHOLD;
  const paceColor = getSeasonPaceColor(isEven ? 0 : delta);
  const max = season ? Math.max(season.toDate, season.average) : 0;

  return (
    <HomeCard
      icon="stats-chart-outline"
      title="Season pace"
      action={season ? <Text style={styles.year}>{season.year}</Text> : undefined}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      skeletonLines={3}
    >
      {season && (
        <View style={styles.body}>
          <View style={styles.hero}>
            <Text style={styles.value}>{season.toDate}</Text>
            <View style={styles.heroBlock}>
              <Text style={styles.heroLabel}>storms by {dateLabel}</Text>
              <View style={styles.pacePill}>
                <Ionicons
                  name={isEven ? "remove" : delta > 0 ? "trending-up" : "trending-down"}
                  size={14}
                  color={paceColor}
                />
                <Text style={[styles.paceLabel, { color: paceColor }]}>
                  {isEven
                    ? "right on the average"
                    : `${Math.abs(delta).toFixed(1)} ${delta > 0 ? "ahead of" : "behind"} average`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bars}>
            <PaceBar
              label={String(season.year)}
              value={season.toDate}
              display={String(season.toDate)}
              max={max}
              color={COLOR.accent}
            />
            <PaceBar
              label="Average"
              value={season.average}
              display={season.average.toFixed(1)}
              max={max}
              color={COLOR.borderStrong}
              isMuted
            />
          </View>

          {season.footnote ? <Text style={styles.footnote}>{season.footnote}</Text> : null}

          <Pressable
            onPress={() => router.push({ pathname: "/calendar", params: { scope: "todate" } })}
            style={({ pressed }) => [styles.more, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Compare every season by this day"
          >
            <Text style={styles.moreLabel}>Compare every season</Text>
            <Ionicons name="chevron-forward" size={14} color={COLOR.accent} />
          </Pressable>
        </View>
      )}
    </HomeCard>
  );
};

const styles = StyleSheet.create({
  year: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
  body: {
    gap: SPACE.lg,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
  },
  value: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 40,
    lineHeight: 46,
    color: COLOR.text,
    fontVariant: ["tabular-nums"],
  },
  heroBlock: {
    flex: 1,
    gap: SPACE.xs,
    alignItems: "flex-start",
  },
  heroLabel: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
  },
  pacePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.surfaceSubtle,
  },
  paceLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
  },
  bars: {
    gap: SPACE.sm,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
  },
  barLabel: {
    width: 56,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  barLabelMuted: {
    fontFamily: "OpenSans_400Regular",
    color: COLOR.textMuted,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.surfaceMuted,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: RADIUS.pill,
  },
  barValue: {
    width: 34,
    textAlign: "right",
    fontFamily: "OpenSans_700Bold",
    fontSize: 13,
    color: COLOR.text,
    fontVariant: ["tabular-nums"],
  },
  barValueMuted: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textMuted,
  },
  footnote: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  more: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    minHeight: 32,
  },
  pressed: {
    opacity: 0.6,
  },
  moreLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
});

export default SeasonCard;
