import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";

type TyphoonSpinnerSize = "small" | "medium" | "large";

const sizeMap: Record<TyphoonSpinnerSize, number> = {
  small: 24,
  medium: 36,
  large: 56,
};

interface TyphoonSpinnerProps {
  size?: TyphoonSpinnerSize;
  color?: string;
}

// The web build drew its own swirl as an SVG path; native reuses the aperture glyph the 404 screen
// already spins, so the loader needs no vector runtime.
const TyphoonSpinner = ({ size = "medium", color = "#0369a1" }: TyphoonSpinnerProps) => {
  const px = sizeMap[size];
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    });

    return () => {
      cancelled = true;
    };
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });

  return (
    <View
      style={[styles.root, { width: px, height: px }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons name="aperture-outline" size={px} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TyphoonSpinner;
