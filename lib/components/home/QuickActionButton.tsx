import { COLOR, HIT_SIZE, RADIUS, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text } from "react-native";

interface QuickActionButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

/** Shared row for the three Discover entries, so they line up as one menu. */
const QuickActionButton = ({ icon, label, onPress }: QuickActionButtonProps) => (
  <Pressable
    onPress={() => {
      Haptics.selectionAsync();
      onPress();
    }}
    style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Ionicons name={icon} size={18} color={COLOR.accent} />
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: HIT_SIZE,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.sm,
  },
  pressed: {
    backgroundColor: COLOR.accentSoft,
  },
  label: {
    flex: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.accent,
  },
});

export default QuickActionButton;
