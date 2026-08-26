import type { QueryState } from "@/lib/api/client";
import DefModal from "@/lib/components/common/DefModal";
import HomeCard from "@/lib/components/home/HomeCard";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { ActiveOnThisDayStorm, IconName, IntensityType, OnThisDayStorm } from "@/lib/types";
import { formatMonthDay, toMonthDay } from "@/lib/utils/date";
import { isExternalPosition } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PREVIEW_YEARS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type Reason = OnThisDayStorm["reason"];
type Filter = "all" | "formed" | "ended" | "active";

interface Marker {
  icon: IconName;
  color: string;
  label: string;
}

const ACTIVE_MARKER: Marker = {
  icon: "ellipse",
  color: COLOR.accentBorder,
  label: "was already under way",
};

const getMarker = (reason: Reason, position: number): Marker => {
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

const getEventYear = (storm: OnThisDayStorm) => {
  const date = storm.reason === "ended" ? storm.dateEnd : storm.dateStart;
  return date ? Number(date.slice(0, 4)) : storm.year;
};

// Local-midnight Date from "YYYY-MM-DD", so day math matches the user's clock.
const parseLocalDate = (date: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getDayProgress = (storm: { dateStart: string; dateEnd: string | null }) => {
  const startDate = parseLocalDate(storm.dateStart);
  const today = new Date();

  // An ongoing storm has no end date: count real days since it formed.
  if (!storm.dateEnd) {
    const day = Math.round((today.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
    return { day, total: null };
  }

  const endDate = parseLocalDate(storm.dateEnd);
  const todayMonth = today.getMonth() + 1;
  const anniversaryYear =
    todayMonth >= startDate.getMonth() + 1 ? startDate.getFullYear() : endDate.getFullYear();
  const anniversaryDate = new Date(anniversaryYear, todayMonth - 1, today.getDate());

  return {
    day: Math.round((anniversaryDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1,
    total: Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1,
  };
};

interface DayEntry {
  key: string;
  name: string;
  intensity: IntensityType;
  position: number;
  year: number;
  formed: boolean;
  ended: boolean;
  active: boolean;
  reason: Reason | null;
  progress: { day: number; total: number | null };
}

const matchesFilter = (entry: DayEntry, filter: Filter): boolean => {
  if (filter === "formed") return entry.formed;
  if (filter === "ended") return entry.ended;
  if (filter === "active") return entry.active;
  return true;
};

const EMPTY_TEXT: Record<Filter, string> = {
  all: "No storm has ever touched this date.",
  formed: "No storm has formed on this date.",
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
    onPress={onPress}
    style={({ pressed }) => [
      styles.tile,
      isSelected && styles.tileSelected,
      pressed && styles.pressed,
    ]}
    accessibilityRole="button"
    accessibilityState={{ selected: isSelected }}
    accessibilityLabel={`${count} ${label.toLowerCase()}`}
    accessibilityHint={isSelected ? "Show every storm again" : `Show only these`}
  >
    <Text style={[styles.tileLabel, isSelected && styles.tileTextSelected]}>{label}</Text>
    <Text style={[styles.tileCount, isSelected && styles.tileTextSelected]}>{count}</Text>
  </Pressable>
);

const StormChip = ({ entry, onPress }: { entry: DayEntry; onPress: () => void }) => {
  const marker = entry.reason ? getMarker(entry.reason, entry.position) : ACTIVE_MARKER;
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
  events: QueryState<OnThisDayStorm[]>;
  active: QueryState<ActiveOnThisDayStorm[]>;
}

const OnThisDayCard = ({ events, active }: OnThisDayCardProps) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const today = new Date();
  const dateLabel = formatMonthDay(toMonthDay(today.getMonth() + 1, today.getDate()));

  const eventList = useMemo(() => events.data ?? [], [events.data]);
  const activeList = useMemo(() => active.data ?? [], [active.data]);

  const entries = useMemo(() => {
    // The active range is inclusive at both ends, so a storm that started or ended today comes
    // back from both endpoints. One record per storm keeps the counts and the lists agreeing.
    const byStorm = new Map<string, DayEntry>();

    for (const storm of eventList) {
      const key = `${storm.name}-${storm.year}`;
      byStorm.set(key, {
        key,
        name: storm.name,
        intensity: storm.intensity,
        position: storm.position,
        year: getEventYear(storm),
        formed: storm.reason !== "ended",
        ended: storm.reason !== "started",
        active: false,
        reason: storm.reason,
        progress: getDayProgress(storm),
      });
    }

    for (const storm of activeList) {
      const key = `${storm.name}-${storm.year}`;
      const existing = byStorm.get(key);
      if (existing) {
        existing.active = true;
        continue;
      }
      byStorm.set(key, {
        key,
        name: storm.name,
        intensity: storm.intensity,
        position: storm.position,
        year: storm.year,
        formed: false,
        ended: false,
        active: true,
        reason: null,
        progress: getDayProgress(storm),
      });
    }

    return [...byStorm.values()].sort(
      (a, b) =>
        b.year - a.year ||
        Number(a.reason === null) - Number(b.reason === null) ||
        a.name.localeCompare(b.name),
    );
  }, [eventList, activeList]);

  const counts = useMemo(
    () => ({
      formed: entries.filter((entry) => entry.formed).length,
      ended: entries.filter((entry) => entry.ended).length,
      active: entries.filter((entry) => entry.active).length,
    }),
    [entries],
  );

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

  const openStorm = (name: string) => {
    setIsExpanded(false);
    router.push(`/info/${name.toLowerCase()}`);
  };

  const toggle = (next: Filter) => setFilter((current) => (current === next ? "all" : next));

  const tiles = (
    <View style={styles.tiles}>
      <CountTile
        label="Formed"
        count={counts.formed}
        isSelected={filter === "formed"}
        onPress={() => toggle("formed")}
      />
      <CountTile
        label="Ended"
        count={counts.ended}
        isSelected={filter === "ended"}
        onPress={() => toggle("ended")}
      />
      <CountTile
        label="Active"
        count={counts.active}
        isSelected={filter === "active"}
        onPress={() => toggle("active")}
      />
    </View>
  );

  const renderGroups = (list: YearGroup[]) => (
    <View style={styles.groups}>
      {list.map((group) => (
        <YearRow key={group.year} group={group} onOpen={openStorm} />
      ))}
    </View>
  );

  const refetchBoth = () => {
    events.refetch();
    active.refetch();
  };

  return (
    <>
      <HomeCard
        icon="calendar-outline"
        title="On this day"
        action={<Text style={styles.date}>{dateLabel}</Text>}
        isLoading={events.isLoading || active.isLoading}
        isError={events.isError || active.isError}
        onRetry={refetchBoth}
        skeletonLines={4}
      >
        <View style={styles.body}>
          {tiles}

          {groups.length === 0 ? (
            <Text style={styles.empty}>{EMPTY_TEXT[filter]}</Text>
          ) : (
            <>
              {renderGroups(groups.slice(0, PREVIEW_YEARS))}

              {groups.length > PREVIEW_YEARS && (
                <Pressable
                  onPress={() => setIsExpanded(true)}
                  hitSlop={8}
                  style={({ pressed }) => [styles.more, pressed && styles.pressed]}
                  accessibilityRole="button"
                >
                  <Text style={styles.moreLabel}>
                    See all {shownCount} across {groups.length} years
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={COLOR.accent} />
                </Pressable>
              )}
            </>
          )}
        </View>
      </HomeCard>

      <DefModal
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        title={`On this day · ${dateLabel}`}
      >
        <View style={styles.body}>
          {tiles}
          {groups.length === 0 ? (
            <Text style={styles.empty}>{EMPTY_TEXT[filter]}</Text>
          ) : (
            renderGroups(groups)
          )}
        </View>
      </DefModal>
    </>
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
