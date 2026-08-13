import EdgeFade from "@/lib/components/common/EdgeFade";
import { COLOR, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useState, type ReactNode } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

interface LegendShellProps {
  label: string;
  accessibilityLabel: string;
  children: ReactNode;
}

/**
 * A legend is reference, not content, so on a phone it starts as one scrollable line pinned above
 * the tab bar and only wraps to its full height when tapped. The web version could afford to
 * wrap across three rows permanently; here that was a fifth of the viewport.
 */
export default function LegendShell({ label, accessibilityLabel, children }: LegendShellProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => !current);
  };

  return (
    <Pressable
      onPress={toggle}
      style={styles.root}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ expanded }}
    >
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>

        {/* Collapsed, the items share the label's row so the whole legend costs one line. The
            scroller sits inside the Pressable: a tap that does not scroll falls through to it. */}
        {!expanded && (
          <EdgeFade style={styles.strip} contentContainerStyle={styles.stripContent}>
            {children}
          </EdgeFade>
        )}

        <Ionicons
          name={expanded ? "chevron-down" : "chevron-up"}
          size={14}
          color={COLOR.textMuted}
        />
      </View>

      {expanded && <View style={styles.wrapped}>{children}</View>}
    </Pressable>
  );
}

interface LegendItemProps {
  label: ReactNode;
  color?: string;
}

export const LegendItem = ({ label, color }: LegendItemProps) => (
  <View style={styles.item}>
    <View style={[styles.swatch, color ? { backgroundColor: color } : styles.swatchEmpty]} />
    {typeof label === "string" ? <Text style={styles.itemLabel}>{label}</Text> : label}
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: 6,
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.borderStrong,
    backgroundColor: COLOR.background,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
  },
  strip: {
    flex: 1,
  },
  stripContent: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  wrapped: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 12,
    rowGap: 6,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.textBody,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  swatchEmpty: {
    backgroundColor: COLOR.surfaceMuted,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
  },
  itemLabel: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textBody,
  },
});
