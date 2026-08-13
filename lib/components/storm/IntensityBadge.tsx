import { BACKGROUND_BADGE, INTENSITY_LABEL, TEXT_COLOR_BADGE } from "@/lib/constants";
import type { IntensityType } from "@/lib/types";
import { StyleSheet, Text, View } from "react-native";

interface IntensityBadgeProps {
  intensity: IntensityType;
  size?: number;
}

const IntensityBadge = ({ intensity, size = 34 }: IntensityBadgeProps) => (
  <View
    style={[
      styles.badge,
      { backgroundColor: BACKGROUND_BADGE[intensity], width: size, height: size },
    ]}
    accessible
    accessibilityLabel={INTENSITY_LABEL[intensity]}
  >
    <Text style={[styles.label, { color: TEXT_COLOR_BADGE[intensity], fontSize: size * 0.42 }]}>
      {intensity}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  label: {
    fontFamily: "OpenSans_700Bold",
  },
});

export default IntensityBadge;
