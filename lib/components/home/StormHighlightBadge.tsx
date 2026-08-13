import { useApiQuery } from "@/lib/api/client";
import { COLOR, RADIUS } from "@/lib/constants/theme";
import type { StormHighlight } from "@/lib/types";
import { capitalize } from "@/lib/utils/format";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// The badge is decorative: a failed request hides it rather than showing an error on the home
// screen, which is why there is no error branch here.
const StormHighlightBadge = () => {
  const router = useRouter();
  const { data, isLoading } = useApiQuery<StormHighlight | null>("/api/v1/storm-highlight");

  // The hero is vertically centred, so arriving late would shove everything under it down.
  if (isLoading) {
    return (
      <View style={styles.root} accessibilityLabel="Loading storm highlight">
        <View style={[styles.pill, styles.pillPlaceholder]} />
        <View style={styles.textPlaceholder} />
      </View>
    );
  }

  if (!data) return null;

  const isActive = data.status === "active";

  return (
    <View style={styles.root}>
      <View style={styles.pill}>
        <View style={[styles.dot, isActive ? styles.dotActive : styles.dotNext]} />
        <Text style={[styles.pillLabel, isActive ? styles.labelActive : styles.labelNext]}>
          {isActive ? "Active now" : "Up next"}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push(`/info/${data.name.toLowerCase()}`)}
        hitSlop={6}
        accessibilityRole="link"
        accessibilityLabel={`Open ${data.name}`}
      >
        <Text style={styles.name}>{capitalize(data.name.toLowerCase())}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push(`/positions/${getPositionSlug(data.position)}`)}
        hitSlop={6}
        accessibilityRole="link"
        accessibilityLabel={`Open position ${getPositionTitle(data.position)}`}
      >
        <Text style={styles.position}>{getPositionTitle(data.position)}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 12,
    rowGap: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 26,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.onHero,
  },
  pillPlaceholder: {
    width: 96,
  },
  textPlaceholder: {
    width: 72,
    height: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.onHero,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: COLOR.danger,
  },
  dotNext: {
    backgroundColor: COLOR.accent,
  },
  pillLabel: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
  },
  labelActive: {
    color: COLOR.danger,
  },
  labelNext: {
    color: COLOR.accent,
  },
  name: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.accent,
  },
  position: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
  },
});

export default StormHighlightBadge;
