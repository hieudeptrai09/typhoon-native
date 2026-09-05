import EdgeFade from "@/lib/components/common/EdgeFade";
import { selectedOptionFor, type OptionAxis } from "@/lib/components/common/ViewOptionsSheet";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { SegmentOption } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

export const AxisChip = ({ option, onPress }: { option: SegmentOption; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    accessibilityRole="button"
    accessibilityLabel={`${option.label}. Tap to change.`}
  >
    {option.swatch ? (
      <View style={[styles.swatch, { backgroundColor: option.swatch }]} />
    ) : (
      option.icon && <Ionicons name={option.icon} size={14} color={COLOR.accent} />
    )}
    <Text style={styles.chipLabel} numberOfLines={1}>
      {option.shortLabel ?? option.label}
    </Text>
    <Ionicons name="chevron-down" size={12} color={COLOR.accent} />
  </Pressable>
);

interface AxisChipRailProps {
  axes: OptionAxis[];
  onPress: (axisLabel: string) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const AxisChipRail = ({ axes, onPress, style, contentContainerStyle }: AxisChipRailProps) => (
  <EdgeFade style={style} contentContainerStyle={[styles.railContent, contentContainerStyle]}>
    {axes.map((axis) => {
      const option = selectedOptionFor(axis);

      return (
        option && <AxisChip key={axis.label} option={option} onPress={() => onPress(axis.label)} />
      );
    })}
  </EdgeFade>
);

const styles = StyleSheet.create({
  railContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.accentSoft,
    borderWidth: 1,
    borderColor: COLOR.accentBorder,
  },
  pressed: {
    opacity: 0.6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.borderStrong,
  },
  chipLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
});

export default AxisChipRail;
