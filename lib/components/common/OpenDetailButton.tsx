import { COLOR } from "@/lib/constants/theme";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export type DetailTarget = { kind: "name"; name: string } | { kind: "position"; position: number };

interface OpenDetailButtonProps {
  target: DetailTarget;
  /** Dismissed first, so the back gesture returns to the dashboard rather than to a stale sheet. */
  onClose: () => void;
}

const routeFor = (target: DetailTarget): string =>
  target.kind === "name"
    ? `/info/${encodeURIComponent(target.name)}`
    : `/positions/${getPositionSlug(target.position)}`;

const labelFor = (target: DetailTarget): string =>
  target.kind === "name" ? `Open ${target.name}` : `Open ${getPositionTitle(target.position)}`;

/**
 * A sheet opened from a cell used to be the end of the trail: whatever it showed, the only way on
 * was back. This carries the same subject into its own screen, where the stack takes over.
 */
const OpenDetailButton = ({ target, onClose }: OpenDetailButtonProps) => (
  <Pressable
    onPress={() => {
      onClose();
      router.push(routeFor(target));
    }}
    style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    accessibilityRole="button"
    accessibilityLabel={labelFor(target)}
  >
    <Text style={styles.label} numberOfLines={1}>
      {labelFor(target)}
    </Text>
    <Ionicons name="arrow-forward" size={16} color={COLOR.textInverse} />
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLOR.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textInverse,
  },
});

export default OpenDetailButton;
