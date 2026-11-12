import { COLOR } from "@/lib/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatTileProps {
  label: string;
  // Never drawn — there is no hover on touch, so it only reaches screen readers.
  hint?: string;
  // A second reading of the value; it may wrap, unlike the value line.
  caption?: string;
  children: ReactNode;
}

const StatTile = ({ label, hint, caption, children }: StatTileProps) => (
  <View style={styles.root} accessible accessibilityLabel={label} accessibilityHint={hint}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value} numberOfLines={1}>
      {children}
    </Text>
    {caption ? (
      <Text style={styles.caption} numberOfLines={2}>
        {caption}
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  // The wrapping cell already stretches to its row; growing into it keeps a tile whose caption
  // wraps level with its neighbour.
  root: {
    flexGrow: 1,
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
  caption: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
});

export default StatTile;
