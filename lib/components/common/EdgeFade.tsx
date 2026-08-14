import { COLOR } from "@/lib/constants/theme";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface EdgeFadeProps {
  children: ReactNode;
  /** On the wrapper, which is what the parent lays out — not on the scroller inside it. */
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: "tablist";
  scrollRef?: RefObject<ScrollView | null>;
  /** Must match what the row sits on, or the fade reads as a grey smudge. */
  backgroundColor?: string;
}

const FADE_WIDTH = 24;
const SLICES = 6;

// react-native has no gradient primitive and the project carries no gradient dependency, so the
// ramp is a handful of stacked slices. Six is enough that the banding is not visible at 24px.
const Fade = ({ side, color }: { side: "left" | "right"; color: string }) => (
  <View
    pointerEvents="none"
    style={[styles.fade, side === "left" ? styles.fadeLeft : styles.fadeRight]}
  >
    {Array.from({ length: SLICES }, (_, index) => {
      const ramp = 1 - index / SLICES;
      return (
        <View
          key={index}
          style={{
            width: FADE_WIDTH / SLICES,
            backgroundColor: color,
            opacity: side === "left" ? ramp : 1 - ramp,
          }}
        />
      );
    })}
  </View>
);

const EdgeFade = ({
  children,
  style,
  contentContainerStyle,
  accessibilityLabel,
  accessibilityRole,
  scrollRef,
  backgroundColor = COLOR.background,
}: EdgeFadeProps) => {
  const [offset, setOffset] = useState(0);
  const [size, setSize] = useState({ content: 0, layout: 0 });
  // Written from three callbacks that each know only one half of the comparison.
  const sizeRef = useRef(size);

  const setSizes = (next: Partial<typeof size>) => {
    const merged = { ...sizeRef.current, ...next };
    if (merged.content === sizeRef.current.content && merged.layout === sizeRef.current.layout) {
      return;
    }
    sizeRef.current = merged;
    setSize(merged);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    setOffset(event.nativeEvent.contentOffset.x);

  const overflows = size.content > size.layout + 1;
  const showStart = overflows && offset > 1;
  const showEnd = overflows && offset + size.layout < size.content - 1;

  return (
    <View style={style}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        onScroll={handleScroll}
        onContentSizeChange={(width) => setSizes({ content: width })}
        onLayout={(event) => setSizes({ layout: event.nativeEvent.layout.width })}
        scrollEventThrottle={16}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
      >
        {children}
      </ScrollView>

      {showStart && <Fade side="left" color={backgroundColor} />}
      {showEnd && <Fade side="right" color={backgroundColor} />}
    </View>
  );
};

const styles = StyleSheet.create({
  fade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: FADE_WIDTH,
    flexDirection: "row",
  },
  fadeLeft: {
    left: 0,
  },
  fadeRight: {
    right: 0,
  },
});

export default EdgeFade;
