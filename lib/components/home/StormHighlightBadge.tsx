import { useApiQuery } from "@/lib/api/client";
import type { StormHighlight } from "@/lib/types";
import { capitalize } from "@/lib/utils/format";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// The badge is decorative: a failed request hides it rather than showing an error on the home
// screen, which is why there is no error branch here.
const StormHighlightBadge = () => {
  const router = useRouter();
  const { data } = useApiQuery<StormHighlight | null>("/api/v1/storm-highlight");

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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#ef4444",
  },
  dotNext: {
    backgroundColor: "#3b82f6",
  },
  pillLabel: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
  },
  labelActive: {
    color: "#dc2626",
  },
  labelNext: {
    color: "#2563eb",
  },
  name: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#7e22ce",
  },
  position: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: "#0f766e",
  },
});

export default StormHighlightBadge;
