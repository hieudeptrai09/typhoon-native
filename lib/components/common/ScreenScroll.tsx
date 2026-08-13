import { SPACE } from "@/lib/constants/theme";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";

interface ScreenScrollProps {
  children: ReactNode;
}

/**
 * Vertical scroller for the heatmap views, whose grid + readout + side panels overflow a phone
 * once the control bar and legend are counted. List views bring their own FlatList and must not
 * be wrapped in this.
 */
const ScreenScroll = ({ children }: ScreenScrollProps) => (
  <ScrollView
    style={styles.root}
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
  >
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.xl,
    gap: SPACE.lg,
  },
});

export default ScreenScroll;
