import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface IndexTileProps {
  label: string;
  count: number;
  icon?: ReactNode;
  onPress: () => void;
}

const IndexTile = ({ label, count, icon, onPress }: IndexTileProps) => {
  const hasStorms = count > 0;
  const text = hasStorms ? `${count} ${count === 1 ? "storm" : "storms"}` : "No storms yet";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        { borderLeftColor: hasStorms ? COLOR.accentBorder : COLOR.textFaint },
        pressed && styles.pressed,
      ]}
      android_ripple={{ color: COLOR.accentSoft }}
      accessibilityRole="link"
      accessibilityLabel={`${label}, ${text}`}
    >
      {icon}
      <View style={styles.body}>
        <Text
          style={[styles.label, { color: hasStorms ? COLOR.text : COLOR.textMuted }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text style={styles.summary} numberOfLines={1}>
          {text}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    minHeight: 60,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.8,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 16,
  },
  summary: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
});

export default IndexTile;
