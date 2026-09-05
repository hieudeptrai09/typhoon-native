import DefModal from "@/lib/components/common/DefModal";
import { OptionGroup, optionGroupHeight } from "@/lib/components/common/OptionRow";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { SegmentOption } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface OptionAxis {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

interface ViewOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  axes: OptionAxis[];
  initialAxis?: string;
}

// Every tab gets the same viewport so switching between them never resizes the sheet: shorter
// axes leave slack below, longer ones (records carries 12 options) scroll. Five rows because
// matching the tallest axis would leave a two-option tab nearly fullscreen.
const VIEWPORT_ROWS = 5;

export const selectedOptionFor = (axis: OptionAxis): SegmentOption | undefined =>
  axis.options.find((option) => option.value === axis.value);

const AxisTab = ({
  axis,
  active,
  onPress,
}: {
  axis: OptionAxis;
  active: boolean;
  onPress: () => void;
}) => {
  const current = selectedOptionFor(axis);
  const locked = axis.options.some((option) => option.blockedReason !== undefined);

  return (
    <Pressable
      onPress={() => {
        if (active) return;
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.tab,
        active && styles.tabActive,
        pressed && !active && styles.pressed,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={axis.label}
      accessibilityValue={{ text: current?.label }}
    >
      <View style={styles.tabHead}>
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
          {axis.label}
        </Text>
        {locked && <Ionicons name="lock-closed" size={10} color={COLOR.textFaint} />}
      </View>

      <View style={styles.tabValue}>
        {current?.swatch ? (
          <View style={[styles.swatch, { backgroundColor: current.swatch }]} />
        ) : (
          current?.icon && (
            <Ionicons
              name={current.icon}
              size={13}
              color={active ? COLOR.accent : COLOR.textMuted}
            />
          )
        )}
        <Text
          style={[styles.tabValueLabel, active && styles.tabValueLabelActive]}
          numberOfLines={1}
        >
          {current?.shortLabel ?? current?.label ?? "—"}
        </Text>
      </View>
    </Pressable>
  );
};

const ViewOptionsSheet = ({ open, onClose, axes, initialAxis }: ViewOptionsSheetProps) => {
  const [activeLabel, setActiveLabel] = useState(initialAxis);

  // Adjusted during render rather than in an effect, which would paint one frame of the old axis
  // before correcting itself.
  const [seen, setSeen] = useState({ open, initialAxis });
  if (seen.open !== open || seen.initialAxis !== initialAxis) {
    setSeen({ open, initialAxis });
    if (open) setActiveLabel(initialAxis);
  }

  // Resolved by label rather than index: switching the view swaps the axis list out from under us.
  const active = axes.find((axis) => axis.label === activeLabel) ?? axes[0];

  const tallest = Math.max(...axes.map((axis) => axis.options.length), 0);
  const viewport = optionGroupHeight(Math.min(tallest, VIEWPORT_ROWS));

  return (
    <DefModal open={open} onClose={onClose} title="View options" scroll={false}>
      {axes.length > 1 && (
        <View style={styles.tabs} accessibilityRole="tablist">
          {axes.map((axis) => (
            <AxisTab
              key={axis.label}
              axis={axis}
              active={axis === active}
              onPress={() => setActiveLabel(axis.label)}
            />
          ))}
        </View>
      )}

      <ScrollView
        style={[styles.viewport, { height: viewport }]}
        contentContainerStyle={styles.viewportContent}
        keyboardShouldPersistTaps="handled"
      >
        {active && (
          <OptionGroup
            key={active.label}
            options={active.options}
            value={active.value}
            onChange={active.onChange}
          />
        )}
      </ScrollView>
    </DefModal>
  );
};

const styles = StyleSheet.create({
  // Shrinks below the fixed height rather than clipping when the sheet hits its own max height.
  viewport: {
    flexShrink: 1,
  },
  viewportContent: {
    paddingBottom: 2,
  },
  tabs: {
    flexDirection: "row",
    gap: SPACE.xs,
    padding: SPACE.xs,
    marginBottom: SPACE.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLOR.surfaceSunken,
  },
  tab: {
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.sm,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: COLOR.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  tabHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tabLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLOR.textMuted,
  },
  tabLabelActive: {
    color: COLOR.textBody,
  },
  tabValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  swatch: {
    width: 11,
    height: 11,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.borderStrong,
  },
  tabValueLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textSecondary,
  },
  tabValueLabelActive: {
    color: COLOR.accent,
  },
});

export default ViewOptionsSheet;
