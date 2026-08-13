import { COLOR } from "@/lib/constants/theme";
import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface SlashToggleButtonProps {
  active: boolean;
  onPress: () => void;
  label: string;
  color?: string;
  children: ReactNode;
}

// Icon toggle where a diagonal slash marks the feature as currently OFF
// (the EyeOff/MicOff convention), so the slash reads as state, not action.
const SlashToggleButton = ({
  active,
  onPress,
  label,
  color = COLOR.textBody,
  children,
}: SlashToggleButtonProps) => (
  <Pressable
    onPress={() => {
      Haptics.selectionAsync();
      onPress();
    }}
    hitSlop={8}
    style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    accessibilityRole="switch"
    accessibilityLabel={label}
    accessibilityState={{ checked: active }}
  >
    <View style={styles.icon}>
      {children}
      {!active && <View style={[styles.slash, { backgroundColor: color }]} />}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    padding: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  icon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  slash: {
    position: "absolute",
    width: 2.5,
    height: 34,
    borderRadius: 1.25,
    transform: [{ rotate: "45deg" }],
  },
});

export default SlashToggleButton;
