import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text } from "react-native";

const zoomEarthUrl = (name: string, year: number): string =>
  `https://zoom.earth/storms/${name.trim().toLowerCase().replace(/\s+/g, "-")}-${year}/`;

interface ZoomEarthLinkProps {
  storm: Storm;
  variant?: "inline" | "row";
}

const ZoomEarthLink = ({ storm, variant = "inline" }: ZoomEarthLinkProps) => (
  <Pressable
    onPress={() => WebBrowser.openBrowserAsync(zoomEarthUrl(storm.name, storm.year))}
    hitSlop={variant === "inline" ? 8 : undefined}
    style={({ pressed }) => [
      styles.link,
      variant === "row" && styles.row,
      pressed && (variant === "row" ? styles.rowPressed : styles.pressed),
    ]}
    accessibilityRole="link"
    accessibilityLabel={`View ${storm.name} ${storm.year} on Zoom Earth`}
  >
    <Text style={styles.label}>Zoom Earth</Text>
    <Ionicons name="open-outline" size={12} color={COLOR.accent} />
  </Pressable>
);

const styles = StyleSheet.create({
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  row: {
    alignSelf: "stretch",
    minHeight: 44,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.border,
  },
  pressed: {
    opacity: 0.6,
  },
  rowPressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
});

export default ZoomEarthLink;
