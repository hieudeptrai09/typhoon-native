import type { QueryState } from "@/lib/api/client";
import DayStormChip from "@/lib/components/calendar/DayStormChip";
import HomeCard from "@/lib/components/home/HomeCard";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { formatMonthDay, monthDayOf, todayISO } from "@/lib/utils/date";
import {
  getDayEntries,
  matchesDayKind,
  type DayEventKind,
  type DayStormEntry,
} from "@/lib/utils/storm/calendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PREVIEW_YEARS = 3;

// Not "Active": the Today tab spends that word on storms happening right now.
const TILES: { kind: DayEventKind; label: string }[] = [
  { kind: "started", label: "Started" },
  { kind: "ended", label: "Ended" },
  { kind: "active", label: "Ongoing" },
];

const EMPTY_TEXT: Record<DayEventKind, string> = {
  started: "No storm has formed on this date.",
  ended: "No storm has dissipated on this date.",
  active: "No storm was under way on this date.",
};

const CountTile = ({
  label,
  count,
  isSelected,
  onPress,
}: {
  label: string;
  count: number;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={() => {
      if (isSelected) return;
      Haptics.selectionAsync();
      onPress();
    }}
    style={({ pressed }) => [
      styles.tile,
      isSelected && styles.tileSelected,
      pressed && !isSelected && styles.pressed,
    ]}
    accessibilityRole="tab"
    accessibilityState={{ selected: isSelected }}
    accessibilityLabel={`${count} ${label.toLowerCase()}`}
  >
    <Text style={[styles.tileLabel, isSelected && styles.tileTextSelected]}>{label}</Text>
    <Text style={[styles.tileCount, isSelected && styles.tileTextSelected]}>{count}</Text>
  </Pressable>
);

interface YearGroup {
  year: number;
  entries: DayStormEntry[];
}

const YearRow = ({
  group,
  kind,
  onOpen,
}: {
  group: YearGroup;
  kind: DayEventKind;
  onOpen: (name: string) => void;
}) => (
  <View style={styles.yearRow}>
    <Text style={styles.year}>{group.year}</Text>
    <View style={styles.chips}>
      {group.entries.map((entry) => (
        <DayStormChip
          key={entry.key}
          entry={entry}
          kind={kind}
          onPress={() => onOpen(entry.storm.name)}
        />
      ))}
    </View>
  </View>
);

interface OnThisDayCardProps {
  query: QueryState<Storm[]>;
}

const OnThisDayCard = ({ query }: OnThisDayCardProps) => {
  const router = useRouter();
  const [kind, setKind] = useState<DayEventKind>("started");
  const { data, isLoading, isError, refetch } = query;

  const monthDay = useMemo(() => monthDayOf(todayISO()), []);
  const dateLabel = formatMonthDay(monthDay);

  const { entries, counts } = useMemo(() => getDayEntries(data ?? [], monthDay), [data, monthDay]);

  const groups = useMemo(() => {
    const byYear = new Map<number, DayStormEntry[]>();

    for (const entry of entries) {
      if (!matchesDayKind(entry, kind)) continue;
      const group = byYear.get(entry.year);
      if (group) group.push(entry);
      else byYear.set(entry.year, [entry]);
    }

    return [...byYear.entries()].map(([year, list]) => ({ year, entries: list }));
  }, [entries, kind]);

  const shownCount = groups.reduce((total, group) => total + group.entries.length, 0);

  const openStorm = (name: string) => router.push(`/info/${name.toLowerCase()}`);
  const openCalendar = () => router.push({ pathname: "/calendar", params: { scope: kind } });

  // No dead end: the link stays even when the preview already shows every year.
  const hasHiddenYears = groups.length > PREVIEW_YEARS;
  const linkLabel = hasHiddenYears
    ? `See all ${shownCount} across ${groups.length} years`
    : "Open the calendar";
  const linkHint = hasHiddenYears
    ? `${linkLabel} in the calendar`
    : `Open ${dateLabel} in the calendar`;

  return (
    <HomeCard
      icon="calendar-outline"
      title="On this day"
      action={<Text style={styles.date}>{dateLabel}</Text>}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      skeletonLines={4}
    >
      <View style={styles.body}>
        <View style={styles.tiles} accessibilityRole="tablist">
          {TILES.map((tile) => (
            <CountTile
              key={tile.kind}
              label={tile.label}
              count={counts[tile.kind]}
              isSelected={kind === tile.kind}
              onPress={() => setKind(tile.kind)}
            />
          ))}
        </View>

        {groups.length === 0 ? (
          <Text style={styles.empty}>{EMPTY_TEXT[kind]}</Text>
        ) : (
          <View style={styles.groups}>
            {groups.slice(0, PREVIEW_YEARS).map((group) => (
              <YearRow key={group.year} group={group} kind={kind} onOpen={openStorm} />
            ))}
          </View>
        )}

        <Pressable
          onPress={openCalendar}
          hitSlop={8}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
          accessibilityRole="link"
          accessibilityLabel={linkHint}
        >
          <Text style={styles.moreLabel}>{linkLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={COLOR.accent} />
        </Pressable>
      </View>
    </HomeCard>
  );
};

const styles = StyleSheet.create({
  date: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  body: {
    gap: SPACE.md,
  },
  tiles: {
    flexDirection: "row",
    gap: SPACE.sm,
  },
  tile: {
    flex: 1,
    borderRadius: RADIUS.sm,
    backgroundColor: COLOR.surfaceSubtle,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
  },
  tileSelected: {
    backgroundColor: COLOR.accentSoft,
    borderColor: COLOR.accentBorder,
  },
  tileLabel: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textBody,
  },
  tileCount: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.text,
    fontVariant: ["tabular-nums"],
  },
  tileTextSelected: {
    color: COLOR.accent,
  },
  groups: {
    gap: SPACE.sm,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.sm,
  },
  year: {
    // Fixed width so the chips line up into a column instead of stepping with the year.
    width: 34,
    paddingTop: 6,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
  chips: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.xs,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: COLOR.textMuted,
  },
  more: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  moreLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.accent,
  },
});

export default OnThisDayCard;
