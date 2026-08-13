import { COLOR } from "@/lib/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatTileProps {
  label: string;
  /** The web build's tooltip text. Native has no hover, so it survives for screen readers only. */
  hint?: string;
  children: ReactNode;
}

const StatTile = ({ label, hint, children }: StatTileProps) => (
  <View style={styles.root} accessible accessibilityLabel={label} accessibilityHint={hint}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value} numberOfLines={1}>
      {children}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    borderRadius: 8,
    backgroundColor: COLOR.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textBody,
  },
  value: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.text,
    fontVariant: ["tabular-nums"],
  },
});

export default StatTile;
