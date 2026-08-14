import * as Haptics from "expo-haptics";
import { useMemo, type ReactNode } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface SwipePagerProps {
  onPrev: () => void;
  onNext: () => void;
  /** Off until the neighbours are known — a swipe that lands nowhere is worse than no swipe. */
  enabled?: boolean;
  children: ReactNode;
}

/** How far across the screen the finger must travel before the swipe counts. */
const DISTANCE_RATIO = 0.22;
/** A flick this fast counts even if it never covered the distance. */
const VELOCITY = 550;
/** Ceiling on how far the page slides under the finger: a hint of give, not a page transition. */
const PEEK = 64;
/** Both screen edges belong to the OS back gesture; starting a page swipe there loses every time. */
const EDGE_GUARD = 28;

/**
 * Horizontal swipe between neighbouring detail pages. The header arrows stay the discoverable
 * control — this is the shortcut for the thumb already resting on the middle of the screen.
 */
const SwipePager = ({ onPrev, onNext, enabled = true, children }: SwipePagerProps) => {
  const { width } = useWindowDimensions();
  const offset = useSharedValue(0);

  const step = (forward: boolean) => {
    Haptics.selectionAsync();
    if (forward) onNext();
    else onPrev();
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        // The lists underneath scroll vertically: give up as soon as the drag leans that way, and
        // do not wake up until it is clearly sideways.
        .activeOffsetX([-24, 24])
        .failOffsetY([-16, 16])
        .hitSlop({ left: -EDGE_GUARD, right: -EDGE_GUARD })
        .onUpdate((event) => {
          // Asymptotic, so the page keeps moving the whole drag but never past PEEK.
          const raw = event.translationX;
          offset.value = (raw / (Math.abs(raw) + PEEK)) * PEEK;
        })
        .onEnd((event) => {
          const committed =
            Math.abs(event.translationX) > width * DISTANCE_RATIO ||
            Math.abs(event.velocityX) > VELOCITY;

          if (committed) runOnJS(step)(event.translationX < 0);
          offset.value = withSpring(0, { damping: 18, stiffness: 220 });
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, width, onPrev, onNext],
  );

  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.root, slide]}>{children}</Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default SwipePager;
