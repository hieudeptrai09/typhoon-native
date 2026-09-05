import { COLOR } from "@/lib/constants/theme";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import TyphoonSymbol from "./TyphoonSymbol";

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

const TyphoonSpinner = ({ size = "medium", color = COLOR.accent }: TyphoonSpinnerProps) => {
  const px = sizeMap[size];
  // A lazy useState initializer, not useRef: the compiler's rules forbid reading a ref during
  // render, and `rotate` below is derived at render time.
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      animation = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animation.start();
    });

    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [spin]);

  // Counter-clockwise, the direction storms actually spin in the northern hemisphere.
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });

  return (
    <View
      style={[styles.root, { width: px, height: px }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <TyphoonSymbol size={px} color={color} />
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
