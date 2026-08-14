import { COLOR, RADIUS } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";

interface HeaderPagerProps {
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
}

const HeaderPager = ({ onPrev, onNext, prevLabel, nextLabel }: HeaderPagerProps) => {
  const step = (go: () => void) => () => {
    Haptics.selectionAsync();
    go();
  };

  return (
    <View style={styles.root}>
      <Pressable
        onPress={step(onPrev)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={prevLabel}
      >
        <Ionicons name="chevron-back" size={22} color={COLOR.textInverse} />
      </Pressable>

      <Pressable
        onPress={step(onNext)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={nextLabel}
      >
        <Ionicons name="chevron-forward" size={22} color={COLOR.textInverse} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
  },
  pressed: {
    opacity: 0.6,
  },
});

export default HeaderPager;
