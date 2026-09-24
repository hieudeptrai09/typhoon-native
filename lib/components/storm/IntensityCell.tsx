import IntensityBadge from "@/lib/components/storm/IntensityBadge";
import { INTENSITY_LABEL } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { IntensityType } from "@/lib/types";
import { StyleSheet, Text, View } from "react-native";

const IntensityCell = ({ intensity }: { intensity: IntensityType }) => (
  <View style={styles.root}>
    <IntensityBadge intensity={intensity} size={26} />
    <Text style={styles.label}>{INTENSITY_LABEL[intensity]}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    flexShrink: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    lineHeight: 16,
    color: COLOR.textBody,
  },
});

export default IntensityCell;
