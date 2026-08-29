import type { QueryState } from "@/lib/api/client";
import type { CalendarScope } from "@/lib/components/calendar/CalendarScopeTabs";
import HomeCard from "@/lib/components/home/HomeCard";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { IconName, Storm } from "@/lib/types";
import { formatMonthDay, monthDayOf, todayISO } from "@/lib/utils/date";
import { isExternalPosition } from "@/lib/utils/position";
import {
  eventYearOf,
  getActiveStorms,
  getDayOfStorm,
  getStormEnds,
  getStormStarts,
} from "@/lib/utils/storm/calendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PREVIEW_YEARS = 3;

type Reason = "started" | "ended" | "both" | null;
type Filter = "started" | "ended" | "ongoing";

const SCOPE_FOR: Record<Filter, CalendarScope> = {
  started: "started",
  ended: "ended",
  ongoing: "active",
};

interface Marker {
  icon: IconName;
  color: string;
  label: string;
}

const ONGOING_MARKER: Marker = {
  icon: "ellipse",
  color: COLOR.accentBorder,
  label: "was already under way",
};

const getMarker = (reason: Exclude<Reason, null>, position: number): Marker => {
  if (isExternalPosition(position)) {
    if (reason === "both") {
      return {
        icon: "refresh",
        color: COLOR.warning,
        label: "entered and exited the West Pacific basin",
      };
    }
    return reason === "started"
      ? { icon: "log-in-outline", color: COLOR.success, label: "entered the West Pacific basin" }
      : {
          icon: "log-out-outline",
          color: COLOR.danger,
          label: "exited the West Pacific basin or dissipated",
        };
  }

  if (reason === "both") {
    return { icon: "refresh", color: COLOR.warning, label: "formed and dissipated" };
  }
  return reason === "started"
    ? { icon: "play", color: COLOR.success, label: "formed" }
    : { icon: "stop", color: COLOR.danger, label: "dissipated" };
};

interface DayEntry {
  key: string;
  name: string;
  intensity: Storm["intensity"];
  position: number;
  // The calendar year this date fell in — not the season year, for a storm that crossed New Year.
  year: number;
  started: boolean;
  ended: boolean;
  ongoing: boolean;
  reason: Reason;
  progress: { day: number; total: number | null };
}

const keyOf = (storm: Storm) => `${storm.name}-${storm.year}`;

const matchesFilter = (entry: DayEntry, filter: Filter): boolean => {
  if (filter === "ended") return entry.ended;
  if (filter === "ongoing") return entry.ongoing;
  return entry.started;
};

const EMPTY_TEXT: Record<Filter, string> = {
  started: "No storm has formed on this date.",
  ended: "No storm has dissipated on this date.",
  ongoing: "No storm was under way on this date.",
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

const StormChip = ({ entry, onPress }: { entry: DayEntry; onPress: () => void }) => {
  const marker = entry.reason ? getMarker(entry.reason, entry.position) : ONGOING_MARKER;
  const { day, total } = entry.progress;
  const trailing = `${day}${total === null ? "" : `/${total}`}`;
  const spoken = `${marker.label}, day ${day}${total === null ? "" : ` of ${total}`}`;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={`${INTENSITY_LABEL[entry.intensity]} ${entry.name}, ${spoken}`}
    >
      <Ionicons name={marker.icon} size={10} color={marker.color} />
      <Text style={[styles.chipName, { color: TEXT_COLOR_WHITE_BACKGROUND[entry.intensity] }]}>
        {entry.name}
      </Text>
      <Text style={styles.chipMeta}>{trailing}</Text>
    </Pressable>
  );
};

interface YearGroup {
  year: number;
  entries: DayEntry[];
}

const YearRow = ({ group, onOpen }: { group: YearGroup; onOpen: (name: string) => void }) => (
  <View style={styles.yearRow}>
    <Text style={styles.year}>{group.year}</Text>
    <View style={styles.chips}>
      {group.entries.map((entry) => (
        <StormChip key={entry.key} entry={entry} onPress={() => onOpen(entry.name)} />
      ))}
    </View>
  </View>
);

interface OnThisDayCardProps {
  query: QueryState<Storm[]>;
}

const OnThisDayCard = ({ query }: OnThisDayCardProps) => {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("started");
  const { data, isLoading, isError, refetch } = query;

  const monthDay = useMemo(() => monthDayOf(todayISO()), []);
  const dateLabel = formatMonthDay(monthDay);

  const { entries, counts } = useMemo(() => {
    const storms = data ?? [];
    const starts = getStormStarts(storms, monthDay);
    const ends = getStormEnds(storms, monthDay);
    const ongoing = getActiveStorms(storms, monthDay);

    const startedKeys = new Set(starts.map(keyOf));
    const endedKeys = new Set(ends.map(keyOf));
    const ongoingKeys = new Set(ongoing.map(keyOf));

    // The three lists overlap: `ongoing` includes the day a storm formed or dissipated.
    const byStorm = new Map<string, DayEntry>();

    for (const storm of [...starts, ...ends, ...ongoing]) {
      const key = keyOf(storm);
      if (byStorm.has(key)) continue;

      const started = startedKeys.has(key);
      const ended = endedKeys.has(key);

      byStorm.set(key, {
        key,
        name: storm.name,
        intensity: storm.intensity,
        position: storm.position,
        year: eventYearOf(storm, monthDay),
        started,
        ended,
        ongoing: ongoingKeys.has(key),
        reason: started && ended ? "both" : started ? "started" : ended ? "ended" : null,
        progress: getDayOfStorm(storm, monthDay),
      });
    }

    const sorted = [...byStorm.values()].sort(
      (a, b) =>
        b.year - a.year ||
        Number(a.reason === null) - Number(b.reason === null) ||
        a.name.localeCompare(b.name),
    );

    return {
      entries: sorted,
      counts: {
        started: startedKeys.size,
        ended: endedKeys.size,
        ongoing: ongoingKeys.size,
      },
    };
  }, [data, monthDay]);

  const groups = useMemo(() => {
    const byYear = new Map<number, DayEntry[]>();

    for (const entry of entries) {
      if (!matchesFilter(entry, filter)) continue;
      const group = byYear.get(entry.year);
      if (group) group.push(entry);
      else byYear.set(entry.year, [entry]);
    }

    return [...byYear.entries()].map(([year, list]) => ({ year, entries: list }));
  }, [entries, filter]);

  const shownCount = groups.reduce((total, group) => total + group.entries.length, 0);

  const openStorm = (name: string) => router.push(`/info/${name.toLowerCase()}`);
  const openCalendar = () =>
    router.push({ pathname: "/calendar", params: { scope: SCOPE_FOR[filter] } });

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
          <CountTile
            label="Started"
            count={counts.started}
            isSelected={filter === "started"}
            onPress={() => setFilter("started")}
          />
          <CountTile
            label="Ended"
            count={counts.ended}
            isSelected={filter === "ended"}
            onPress={() => setFilter("ended")}
          />
          <CountTile
            label="Ongoing"
            count={counts.ongoing}
            isSelected={filter === "ongoing"}
            onPress={() => setFilter("ongoing")}
          />
        </View>

        {groups.length === 0 ? (
          <Text style={styles.empty}>{EMPTY_TEXT[filter]}</Text>
        ) : (
          <View style={styles.groups}>
            {groups.slice(0, PREVIEW_YEARS).map((group) => (
              <YearRow key={group.year} group={group} onOpen={openStorm} />
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
    paddingTop: 5,
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
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.surfaceSubtle,
  },
  chipName: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 13,
  },
  chipMeta: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    color: COLOR.textFaint,
    fontVariant: ["tabular-nums"],
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
