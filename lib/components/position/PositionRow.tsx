import { COLOR } from "@/lib/constants/theme";
import { getPositionTitle } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface PositionRowProps {
  position: number;
  enabled: boolean;
  onPress?: () => void;
  children: ReactNode;
}

const PositionRow = ({ position, enabled, onPress, children }: PositionRowProps) => (
  <Pressable
    onPress={enabled ? onPress : undefined}
    disabled={!enabled}
    style={({ pressed }) => [styles.row, pressed && enabled && styles.rowPressed]}
    android_ripple={enabled ? { color: COLOR.accentSoft } : undefined}
    accessibilityRole={enabled ? "button" : "text"}
    accessibilityLabel={`Position ${getPositionTitle(position)}`}
  >
    <View style={styles.chip}>
      <Text style={styles.chipText}>{getPositionTitle(position)}</Text>
    </View>
    <View style={styles.content}>{children}</View>
    {enabled && <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />}
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLOR.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  rowPressed: {
    opacity: 0.8,
  },
  chip: {
    minWidth: 38,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLOR.surfaceMuted,
    alignItems: "center",
  },
  chipText: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 12,
    color: COLOR.textBody,
  },
  content: {
    flex: 1,
    gap: 4,
  },
});

export default PositionRow;
