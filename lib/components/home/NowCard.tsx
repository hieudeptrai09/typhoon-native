import type { QueryState } from "@/lib/api/client";
import HomeCard from "@/lib/components/home/HomeCard";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { StormHighlight } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { capitalize } from "@/lib/utils/format";
import { getPositionTitle } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NowCardProps {
  query: QueryState<StormHighlight[]>;
}

// Both parts stay missing until the extended get_storm_highlight is deployed.
const metaOf = (storm: StormHighlight): string => {
  if (storm.status !== "active") return "Next name in the rotation";
  return [
    storm.intensity ? INTENSITY_LABEL[storm.intensity] : null,
    storm.dateStart ? formatStormDateRange(storm.dateStart) : null,
  ]
    .filter(Boolean)
    .join(" · ");
};

const nameColorOf = (storm: StormHighlight): string =>
  storm.status === "active" && storm.intensity
    ? TEXT_COLOR_WHITE_BACKGROUND[storm.intensity]
    : COLOR.accent;

interface StormItemProps {
  storm: StormHighlight;
  onOpen: () => void;
}

// Name, then a meta line led by the position: leading it keeps the position out of reach of the
// single-line truncation and aligns it down the list. The whole item is one tap target.
const StormItem = ({ storm, onOpen }: StormItemProps) => {
  const meta = metaOf(storm);

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={`Open ${storm.name}, position ${getPositionTitle(storm.position)}`}
    >
      <View style={styles.body}>
        <Text style={[styles.name, { color: nameColorOf(storm) }]} numberOfLines={1}>
          {capitalize(storm.name.toLowerCase())}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          <Text style={styles.metaPosition}>{getPositionTitle(storm.position)}</Text>
          {meta ? ` · ${meta}` : ""}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLOR.textFaint} />
    </Pressable>
  );
};

// get_storm_highlight never mixes the two: it answers with every ongoing storm, or — when none
// are — with a single upcoming name.
const NowCard = ({ query }: NowCardProps) => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = query;

  const storms = data ?? [];
  const isActive = storms.length > 0 && storms[0].status === "active";

  if (!isLoading && !isError && storms.length === 0) return null;

  const openStorm = (name: string) => router.push(`/info/${name.toLowerCase()}`);

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
      <View>
        {storms.map((storm) => (
          <StormItem
            key={`${storm.name}-${storm.position}`}
            storm={storm}
            onOpen={() => openStorm(storm.name)}
          />
        ))}
      </View>
    </HomeCard>
  );
};

const styles = StyleSheet.create({
  count: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingVertical: SPACE.sm,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 18,
    lineHeight: 24,
  },
  meta: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
    color: COLOR.textMuted,
  },
  metaPosition: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textSecondary,
  },
  pressed: {
    opacity: 0.6,
  },
});

export default NowCard;
