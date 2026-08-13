import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface HomeCardProps {
  icon: IconName;
  title: string;
  /** Rendered on the header row, opposite the title — a shuffle button, a "see all" link. */
  action?: ReactNode;
  /** Sits under the header, above the body: a segmented control, a caption. */
  toolbar?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Skeleton bars drawn while loading, so the card keeps its height across the fetch. */
  skeletonLines?: number;
  children: ReactNode;
}

/**
 * Shell for the Today feed. It owns the loading and error states because FrownError is a
 * full-screen treatment — one failing card must not blank out the three beside it.
 */
const HomeCard = ({
  icon,
  title,
  action,
  toolbar,
  isLoading = false,
  isError = false,
  onRetry,
  skeletonLines = 2,
  children,
}: HomeCardProps) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <Ionicons name={icon} size={16} color={COLOR.accent} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actionSlot}>{action}</View>
    </View>

    {toolbar ? <View style={styles.toolbar}>{toolbar}</View> : null}

    {isLoading ? (
      <View style={styles.skeleton} accessibilityLabel={`Loading ${title}`}>
        {Array.from({ length: skeletonLines }, (_, index) => (
          <View key={index} style={[styles.bar, index === skeletonLines - 1 && styles.barShort]} />
        ))}
      </View>
    ) : isError ? (
      <View style={styles.error}>
        <Text style={styles.errorText}>Couldn&apos;t load this right now.</Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            hitSlop={10}
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Retry ${title}`}
          >
            <Ionicons name="refresh" size={14} color={COLOR.accent} />
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        )}
      </View>
    ) : (
      children
    )}
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: SPACE.md,
    padding: SPACE.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLOR.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
  },
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.accent,
  },
  actionSlot: {
    flex: 1,
    alignItems: "flex-end",
  },
  toolbar: {
    marginTop: -SPACE.xs,
  },
  skeleton: {
    gap: SPACE.sm,
    paddingVertical: SPACE.xs,
  },
  bar: {
    height: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.surfaceMuted,
  },
  barShort: {
    width: "60%",
  },
  error: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACE.md,
  },
  errorText: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  retryLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.accent,
  },
});

export default HomeCard;
