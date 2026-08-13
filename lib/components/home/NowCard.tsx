import type { QueryState } from "@/lib/api/client";
import HomeCard from "@/lib/components/home/HomeCard";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { StormHighlight } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { capitalize } from "@/lib/utils/format";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NowCardProps {
  query: QueryState<StormHighlight[]>;
}

/** The one "what is happening right now" surface in the app, so it leads the feed. */
const NowCard = ({ query }: NowCardProps) => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = query;
  const [offset, setOffset] = useState(0);

  // Several storms can be ongoing at once; the rotation only ever has one name coming next.
  const candidates = data ?? [];
  // Modulo rather than a clamp: a refetch can hand back a shorter list than the one being cycled.
  const index = candidates.length > 0 ? offset % candidates.length : 0;
  const current = candidates[index] ?? null;

  // Nothing ongoing and no next name resolved: drop the card rather than show an empty shell.
  if (!isLoading && !isError && !current) return null;

  const isActive = current?.status === "active";
  const nameColor =
    isActive && current?.intensity ? TEXT_COLOR_WHITE_BACKGROUND[current.intensity] : COLOR.accent;

  // Empty rather than a stand-in like "Ongoing": the card title already says the storm is active,
  // so a filler line would only repeat it. Both parts are missing until the extended
  // get_storm_highlight is deployed.
  const meta = isActive
    ? [
        current?.intensity ? INTENSITY_LABEL[current.intensity] : null,
        current?.dateStart ? formatStormDateRange(current.dateStart) : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Next name in the rotation";

  return (
    <HomeCard
      icon={isActive ? "pulse-outline" : "arrow-forward-circle-outline"}
      title={isActive ? "Active now" : "Up next"}
      action={
        // Only when there is somewhere to go — a control that re-renders the same name reads as
        // broken, and "Up next" is a single name by definition.
        candidates.length > 1 ? (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setOffset((value) => value + 1);
            }}
            hitSlop={12}
            style={({ pressed }) => [styles.shuffle, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Show another ongoing storm"
          >
            <Text style={styles.counter}>
              {index + 1}/{candidates.length}
            </Text>
            <Ionicons name="shuffle" size={18} color={COLOR.accent} />
          </Pressable>
        ) : undefined
      }
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      skeletonLines={2}
    >
      {current && (
        <View style={styles.body}>
          <Pressable
            onPress={() => router.push(`/info/${current.name.toLowerCase()}`)}
            style={({ pressed }) => [styles.nameRow, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={`Open ${current.name}`}
          >
            <View style={styles.nameBlock}>
              <Text style={[styles.name, { color: nameColor }]} numberOfLines={1}>
                {capitalize(current.name.toLowerCase())}
              </Text>
              {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLOR.textFaint} />
          </Pressable>

          <Pressable
            onPress={() => router.push(`/positions/${getPositionSlug(current.position)}`)}
            hitSlop={8}
            style={({ pressed }) => [styles.positionChip, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={`Open position ${getPositionTitle(current.position)}`}
          >
            <Ionicons name="grid-outline" size={13} color={COLOR.accent} />
            <Text style={styles.positionLabel}>{getPositionTitle(current.position)}</Text>
          </Pressable>
        </View>
      )}
    </HomeCard>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: SPACE.md,
    alignItems: "flex-start",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    alignSelf: "stretch",
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  shuffle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  counter: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.textFaint,
    fontVariant: ["tabular-nums"],
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 26,
  },
  meta: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
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
