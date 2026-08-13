import type { QueryState } from "@/lib/api/client";
import DefModal from "@/lib/components/common/DefModal";
import SegmentedControl from "@/lib/components/common/SegmentedControl";
import HomeCard from "@/lib/components/home/HomeCard";
import { INTENSITY_LABEL, MONTH_NAMES, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { ActiveOnThisDayStorm, IconName, IntensityType, OnThisDayStorm } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { isExternalPosition } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PREVIEW_COUNT = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type Scope = "events" | "active";

const getReasonIcon = (storm: OnThisDayStorm): { icon: IconName; color: string; label: string } => {
  if (isExternalPosition(storm.position)) {
    if (storm.reason === "both") {
      return {
        icon: "refresh",
        color: COLOR.warning,
        label: "Entered and exited the West Pacific basin",
      };
    }
    return storm.reason === "started"
      ? { icon: "log-in-outline", color: COLOR.success, label: "Entered the West Pacific basin" }
      : { icon: "log-out-outline", color: COLOR.danger, label: "Exited the West Pacific basin" };
  }

  if (storm.reason === "both") {
    return { icon: "refresh", color: COLOR.warning, label: "Formed and dissipated" };
  }
  return storm.reason === "started"
    ? { icon: "play", color: COLOR.success, label: "Formed" }
    : { icon: "stop", color: COLOR.danger, label: "Dissipated" };
};

const getVerb = (storm: OnThisDayStorm) => {
  if (isExternalPosition(storm.position)) {
    return storm.reason === "both"
      ? "entered and later exited the West Pacific basin or dissipated"
      : storm.reason === "started"
        ? "entered the West Pacific basin"
        : "exited the West Pacific basin or dissipated";
  }
  return storm.reason === "both"
    ? "formed and dissipated"
    : storm.reason === "started"
      ? "formed"
      : "dissipated";
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

const getDayProgress = (storm: ActiveOnThisDayStorm) => {
  const startDate = parseLocalDate(storm.dateStart);
  const today = new Date();

  // An ongoing storm has no end date: count real days since it formed.
  if (!storm.dateEnd) {
    const dayOfStorm = Math.round((today.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
    return { dayOfStorm, totalDays: null };
  }

  const endDate = parseLocalDate(storm.dateEnd);
  const todayMonth = today.getMonth() + 1;
  const anniversaryYear =
    todayMonth >= startDate.getMonth() + 1 ? startDate.getFullYear() : endDate.getFullYear();
  const anniversaryDate = new Date(anniversaryYear, todayMonth - 1, today.getDate());

  const dayOfStorm = Math.round((anniversaryDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
  return { dayOfStorm, totalDays };
};

interface StormNameProps {
  name: string;
  intensity: IntensityType;
  onNavigate: () => void;
}

const StormName = ({ name, intensity, onNavigate }: StormNameProps) => (
  <Text
    style={[styles.name, { color: TEXT_COLOR_WHITE_BACKGROUND[intensity] }]}
    onPress={onNavigate}
  >
    {name}
  </Text>
);

const EventItem = ({ storm, onNavigate }: { storm: OnThisDayStorm; onNavigate: () => void }) => {
  const { icon, color, label } = getReasonIcon(storm);

  return (
    <View style={styles.item}>
      <Ionicons
        name={icon}
        size={14}
        color={color}
        accessibilityLabel={label}
        style={styles.bullet}
      />
      <Text style={styles.text}>
        <Text style={styles.year}>{getEventYear(storm)}</Text>: {INTENSITY_LABEL[storm.intensity]}{" "}
        <StormName name={storm.name} intensity={storm.intensity} onNavigate={onNavigate} />{" "}
        {getVerb(storm)}
      </Text>
    </View>
  );
};

const ActiveItem = ({
  storm,
  onNavigate,
}: {
  storm: ActiveOnThisDayStorm;
  onNavigate: () => void;
}) => {
  const { dayOfStorm, totalDays } = getDayProgress(storm);

  return (
    <View style={styles.item}>
      <Ionicons name="ellipse" size={7} color={COLOR.accentBorder} style={styles.dot} />
      <View style={styles.itemBody}>
        <Text style={styles.text}>
          <Text style={styles.year}>{storm.year}</Text>: {INTENSITY_LABEL[storm.intensity]}{" "}
          <StormName name={storm.name} intensity={storm.intensity} onNavigate={onNavigate} /> (
          {formatStormDateRange(storm.dateStart, storm.dateEnd ?? undefined)})
        </Text>
        <Text style={styles.progress}>
          Day <Text style={styles.progressValue}>{dayOfStorm}</Text>
          {totalDays !== null ? (
            <>
              /<Text style={styles.progressValue}>{totalDays}</Text>
            </>
          ) : null}
        </Text>
      </View>
    </View>
  );
};

interface OnThisDayCardProps {
  events: QueryState<OnThisDayStorm[]>;
  active: QueryState<ActiveOnThisDayStorm[]>;
}

/**
 * The web build hid these behind two entries of a header popover, each opening a modal on its own
 * fetch. Both answer the same question about the same date, so here they share one card and the
 * data is already on screen — the sheet is only the overflow for a long list.
 */
const OnThisDayCard = ({ events, active }: OnThisDayCardProps) => {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("events");
  const [isExpanded, setIsExpanded] = useState(false);

  const today = new Date();
  const dateLabel = `${MONTH_NAMES[today.getMonth() + 1]} ${today.getDate()}`;

  const query = scope === "events" ? events : active;
  const storms = query.data ?? [];
  const preview = storms.slice(0, PREVIEW_COUNT);

  const openStorm = (name: string) => {
    setIsExpanded(false);
    router.push(`/info/${name.toLowerCase()}`);
  };

  const renderItems = (list: (OnThisDayStorm | ActiveOnThisDayStorm)[]) => (
    <View style={styles.list}>
      {list.map((storm, index) =>
        scope === "events" ? (
          <EventItem
            key={`${storm.name}-${storm.year}-${index}`}
            storm={storm as OnThisDayStorm}
            onNavigate={() => openStorm(storm.name)}
          />
        ) : (
          <ActiveItem
            key={`${storm.name}-${storm.year}-${index}`}
            storm={storm as ActiveOnThisDayStorm}
            onNavigate={() => openStorm(storm.name)}
          />
        ),
      )}
    </View>
  );

  return (
    <>
      <HomeCard
        icon="calendar-outline"
        title="On this day"
        action={<Text style={styles.date}>{dateLabel}</Text>}
        toolbar={
          <SegmentedControl<Scope>
            options={[
              { value: "events", label: "Formed / ended", icon: "flag-outline" },
              { value: "active", label: "In progress", icon: "water-outline" },
            ]}
            value={scope}
            onChange={setScope}
            accessibilityLabel="On this day scope"
          />
        }
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={query.refetch}
        skeletonLines={3}
      >
        {storms.length === 0 ? (
          <Text style={styles.empty}>
            {scope === "events"
              ? "No storms formed or dissipated on this day."
              : "No storms were active on this date in past years."}
          </Text>
        ) : (
          <View style={styles.body}>
            {renderItems(preview)}

            {storms.length > PREVIEW_COUNT && (
              <Pressable
                onPress={() => setIsExpanded(true)}
                hitSlop={8}
                style={({ pressed }) => [styles.more, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Text style={styles.moreLabel}>See all {storms.length}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLOR.accent} />
              </Pressable>
            )}
          </View>
        )}
      </HomeCard>

      <DefModal
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        title={`On this day · ${dateLabel}`}
      >
        {renderItems(storms)}
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
  list: {
    gap: SPACE.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.sm,
  },
  // Nudged onto the first text line, which sits lower than the icon box's own top edge.
  bullet: {
    marginTop: 3,
  },
  dot: {
    marginTop: 7,
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  text: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: COLOR.textBody,
  },
  year: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  name: {
    fontFamily: "OpenSans_700Bold",
  },
  progress: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  progressValue: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textSecondary,
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
