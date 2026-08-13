import LegendShell from "@/lib/components/common/LegendShell";
import {
  BACKGROUND_BADGE,
  INTENSITY_LABEL,
  INTENSITY_RANK,
  SORTING_RANK,
  TEXT_COLOR_BADGE,
} from "@/lib/constants";
import type { IntensityType } from "@/lib/types";
import { StyleSheet, Text, View } from "react-native";

export default function IntensityLegend() {
  return (
    <LegendShell label="Intensity Scale:" accessibilityLabel="Intensity scale legend">
      {(Object.keys(INTENSITY_LABEL) as IntensityType[])
        .sort((a, b) => SORTING_RANK[a] - SORTING_RANK[b])
        .map((intensity) => (
          <View key={intensity} style={styles.item}>
            <View style={[styles.badge, { backgroundColor: BACKGROUND_BADGE[intensity] }]}>
              <Text style={[styles.badgeText, { color: TEXT_COLOR_BADGE[intensity] }]}>
                {intensity}
              </Text>
            </View>
            <Text style={styles.label}>
              {INTENSITY_LABEL[intensity]} ({INTENSITY_RANK[intensity]})
            </Text>
          </View>
        ))}
    </LegendShell>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 10,
  },
  label: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: "#475569",
  },
});
