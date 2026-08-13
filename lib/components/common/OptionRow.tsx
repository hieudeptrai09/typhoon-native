import type { SegmentOption } from "@/lib/components/common/SegmentedControl";
import { COLOR, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface OptionRowProps {
  option: SegmentOption;
  selected: boolean;
  onPress: () => void;
}

/** One full-width choice in an options sheet — the phone-sized replacement for a segment. */
const OptionRow = ({ option, selected, onPress }: OptionRowProps) => (
  <Pressable
    onPress={() => {
      if (selected) return;
      Haptics.selectionAsync();
      onPress();
    }}
    style={({ pressed }) => [styles.row, selected && styles.rowActive, pressed && styles.pressed]}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={option.label}
  >
    {option.icon && (
      <Ionicons name={option.icon} size={18} color={selected ? COLOR.accent : COLOR.textMuted} />
    )}
    <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>
      {option.label}
    </Text>
    {selected && <Ionicons name="checkmark" size={18} color={COLOR.accent} />}
  </Pressable>
);

interface OptionGroupProps {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export const OptionGroup = ({ label, options, value, onChange }: OptionGroupProps) => (
  <View>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.group}>
      {options.map((option) => (
        <OptionRow
          key={option.value}
          option={option}
          selected={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.textMuted,
    marginBottom: SPACE.sm,
  },
  group: {
    gap: SPACE.sm,
    marginBottom: SPACE.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLOR.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  rowActive: {
    backgroundColor: COLOR.accentSoft,
    borderColor: COLOR.accentBorder,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    flex: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 15,
    color: COLOR.textSecondary,
  },
  labelActive: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.accent,
  },
});

export default OptionRow;
