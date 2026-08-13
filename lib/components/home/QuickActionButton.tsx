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
    <Ionicons name={icon} size={18} color="#b45309" />
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pressed: {
    backgroundColor: "#fef3c7",
  },
  label: {
    flex: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#b45309",
  },
});

export default QuickActionButton;
