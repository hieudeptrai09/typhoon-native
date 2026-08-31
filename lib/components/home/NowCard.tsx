import type { QueryState } from "@/lib/api/client";
import HomeCard from "@/lib/components/home/HomeCard";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { StormHighlight } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { capitalize } from "@/lib/utils/format";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NowCardProps {
  query: QueryState<StormHighlight[]>;
}

// Both parts stay missing until the extended get_storm_highlight is deployed.
const activeMeta = (storm: StormHighlight): string =>
  [
    storm.intensity ? INTENSITY_LABEL[storm.intensity] : null,
    storm.dateStart ? formatStormDateRange(storm.dateStart) : null,
  ]
    .filter(Boolean)
    .join(" · ");

const nameColorOf = (storm: StormHighlight): string =>
  storm.status === "active" && storm.intensity
    ? TEXT_COLOR_WHITE_BACKGROUND[storm.intensity]
    : COLOR.accent;

interface StormProps {
  storm: StormHighlight;
  onOpen: () => void;
}

const HeroStorm = ({
  storm,
  onOpen,
  onOpenPosition,
}: StormProps & { onOpenPosition: () => void }) => {
  const meta = storm.status === "active" ? activeMeta(storm) : "Next name in the rotation";

  return (
    <View style={styles.hero}>
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [styles.heroRow, pressed && styles.pressed]}
        accessibilityRole="link"
        accessibilityLabel={`Open ${storm.name}`}
      >
        <View style={styles.heroBlock}>
          <Text style={[styles.heroName, { color: nameColorOf(storm) }]} numberOfLines={1}>
            {capitalize(storm.name.toLowerCase())}
          </Text>
          {meta ? <Text style={styles.heroMeta}>{meta}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLOR.textFaint} />
      </Pressable>

      <Pressable
        onPress={onOpenPosition}
        hitSlop={8}
        style={({ pressed }) => [styles.positionChip, pressed && styles.pressed]}
        accessibilityRole="link"
        accessibilityLabel={`Open position ${getPositionTitle(storm.position)}`}
      >
        <Ionicons name="grid-outline" size={13} color={COLOR.accent} />
        <Text style={styles.positionLabel}>{getPositionTitle(storm.position)}</Text>
      </Pressable>
    </View>
  );
};

// No position link on purpose: two tap targets on one 44pt row is a miss waiting to happen.
const StormRow = ({ storm, onOpen }: StormProps) => (
  <Pressable
    onPress={onOpen}
    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    accessibilityRole="link"
    accessibilityLabel={`Open ${storm.name}`}
  >
    <View style={styles.rowBlock}>
      <Text style={[styles.rowName, { color: nameColorOf(storm) }]} numberOfLines={1}>
        {capitalize(storm.name.toLowerCase())}
      </Text>
      <Text style={styles.rowMeta} numberOfLines={1}>
        {activeMeta(storm)}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLOR.textFaint} />
  </Pressable>
);

// get_storm_highlight never mixes the two: it answers with every ongoing storm, or — when none
// are — with a single upcoming name.
const NowCard = ({ query }: NowCardProps) => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = query;

  const storms = data ?? [];
  const isActive = storms.length > 0 && storms[0].status === "active";

  if (!isLoading && !isError && storms.length === 0) return null;

  const openStorm = (name: string) => router.push(`/info/${name.toLowerCase()}`);
  const openPosition = (position: number) => router.push(`/positions/${getPositionSlug(position)}`);

  return (
    <HomeCard
      icon={isActive ? "pulse-outline" : "time-outline"}
      title={isActive ? "Active now" : "Up next"}
      action={
        isActive && storms.length > 1 ? (
          <Text style={styles.count}>{storms.length} storms</Text>
        ) : undefined
      }
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      skeletonLines={2}
    >
      {storms.length === 1 ? (
        <HeroStorm
          storm={storms[0]}
          onOpen={() => openStorm(storms[0].name)}
          onOpenPosition={() => openPosition(storms[0].position)}
        />
      ) : (
        <View style={styles.list}>
          {storms.map((storm) => (
            <StormRow
              key={`${storm.name}-${storm.position}`}
              storm={storm}
              onOpen={() => openStorm(storm.name)}
            />
          ))}
        </View>
      )}
    </HomeCard>
  );
};

const styles = StyleSheet.create({
  count: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  hero: {
    gap: SPACE.md,
    alignItems: "flex-start",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    alignSelf: "stretch",
  },
  heroBlock: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 26,
  },
  heroMeta: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
  },
  list: {
    gap: SPACE.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingVertical: SPACE.sm,
  },
  rowBlock: {
    flex: 1,
    gap: 1,
  },
  rowName: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 18,
  },
  rowMeta: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  pressed: {
    opacity: 0.6,
  },
  positionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.accentSoft,
  },
  positionLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
});

export default NowCard;
