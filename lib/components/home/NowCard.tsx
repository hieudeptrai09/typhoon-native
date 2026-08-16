import type { QueryState } from "@/lib/api/client";
import HomeCard from "@/lib/components/home/HomeCard";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { StormHighlight } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { capitalize } from "@/lib/utils/format";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import { pickAnotherHighlight } from "@/lib/utils/storm/highlights";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface NowCardProps {
  query: QueryState<StormHighlight[]>;
}

// Spins the icon in place rather than swapping in a spinner, whose different size would shift the
// counter beside it every time a refetch starts.
const BusyIcon = ({ name, busy }: { name: "shuffle" | "refresh"; busy: boolean }) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!busy) {
      spin.setValue(0);
      return;
    }

    let animation: Animated.CompositeAnimation | undefined;
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      animation = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animation.start();
    });

    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [busy, spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Ionicons name={name} size={18} color={busy ? COLOR.textFaint : COLOR.accent} />
    </Animated.View>
  );
};

const NowCard = ({ query }: NowCardProps) => {
  const router = useRouter();
  const { data, isLoading, isError, isRefetching, refetch } = query;
  // Held by name, not by index: a refetch can reorder or shorten the list, and a fixed index would
  // then land back on the storm the last tap drew away from.
  const [shownName, setShownName] = useState<string | null>(null);
  const leftBehind = useRef<string | null>(null);

  const candidates = useMemo(() => data ?? [], [data]);
  const index = Math.max(0, candidates.findIndex((storm) => storm.name === shownName));
  const current = candidates[index] ?? null;
  const hasRotation = candidates.length > 1;

  // The tap drew against the list already in hand; this lands the same tap on the fresh one. Only
  // redraws when that first pick no longer holds, since changing the card twice on one tap reads as
  // a glitch rather than a shuffle.
  useEffect(() => {
    const pending = leftBehind.current;
    if (pending === null || candidates.length === 0) return;
    leftBehind.current = null;

    // Functional form keeps shownName out of the deps: a tap writes it one render before the fresh
    // list lands, which would fire this against the stale list.
    setShownName((shown) => {
      const holds = shown !== pending && candidates.some((storm) => storm.name === shown);
      return holds ? shown : pickAnotherHighlight(candidates, pending);
    });
  }, [candidates]);

  // A storm that started since the screen opened only exists on the server, so the draw and the
  // refetch are one tap.
  const onRefresh = () => {
    Haptics.selectionAsync();
    leftBehind.current = current?.name ?? null;
    setShownName(pickAnotherHighlight(candidates, current?.name ?? null));
    if (!isRefetching) refetch();
  };

  if (!isLoading && !isError && !current) return null;

  const isActive = current?.status === "active";
  const nameColor =
    isActive && current?.intensity ? TEXT_COLOR_WHITE_BACKGROUND[current.intensity] : COLOR.accent;

  // Both parts stay missing until the extended get_storm_highlight is deployed.
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
      icon={isActive ? "pulse-outline" : "time-outline"}
      title={isActive ? "Active now" : "Up next"}
      action={
        // The error state carries its own Retry, which this would duplicate.
        isLoading || isError ? undefined : (
          <Pressable
            onPress={onRefresh}
            hitSlop={12}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ busy: isRefetching }}
            accessibilityLabel={
              hasRotation
                ? `Refresh and show another storm, ${index + 1} of ${candidates.length}`
                : "Refresh"
            }
          >
            {hasRotation && (
              <Text style={styles.counter}>
                {index + 1}/{candidates.length}
              </Text>
            )}
            <BusyIcon name={hasRotation ? "shuffle" : "refresh"} busy={isRefetching} />
          </Pressable>
        )
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
  refreshButton: {
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
