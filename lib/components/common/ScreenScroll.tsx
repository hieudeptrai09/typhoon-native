import { useRefreshControl } from "@/lib/components/common/RefreshContext";
import { SPACE } from "@/lib/constants/theme";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";

interface ScreenScrollProps {
  children: ReactNode;
}

// List views bring their own FlatList and must not be wrapped in this.
const ScreenScroll = ({ children }: ScreenScrollProps) => {
  const refreshControl = useRefreshControl();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
};

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
