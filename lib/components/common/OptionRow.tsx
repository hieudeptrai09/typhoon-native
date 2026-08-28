import { COLOR, SPACE } from "@/lib/constants/theme";
import type { SegmentOption } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface OptionRowProps {
  option: SegmentOption;
  selected: boolean;
  onPress: () => void;
}

const OptionRow = ({ option, selected, onPress }: OptionRowProps) => {
  const blocked = option.blockedReason !== undefined;
  const note = option.blockedReason ?? option.description;
  const glyphColor = blocked ? COLOR.disabled : selected ? COLOR.accent : COLOR.textMuted;

  return (
    <Pressable
      onPress={() => {
        if (selected || blocked) return;
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowActive,
        blocked && styles.rowBlocked,
        pressed && !blocked && styles.pressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: blocked }}
      accessibilityLabel={option.label}
      accessibilityHint={note}
    >
      {option.swatch ? (
        <View
          style={[styles.swatch, { backgroundColor: option.swatch }, blocked && styles.faded]}
        />
      ) : (
        option.icon && <Ionicons name={option.icon} size={18} color={glyphColor} />
      )}

      <View style={styles.text}>
        <Text
          style={[styles.label, selected && styles.labelActive, blocked && styles.labelBlocked]}
          numberOfLines={1}
        >
          {option.label}
        </Text>
        {note !== undefined && (
          <Text style={styles.note} numberOfLines={2}>
            {note}
          </Text>
        )}
      </View>

      {blocked ? (
        <Ionicons name="lock-closed" size={15} color={COLOR.disabled} />
      ) : (
        selected && <Ionicons name="checkmark" size={18} color={COLOR.accent} />
      )}
    </Pressable>
  );
};

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
    paddingVertical: SPACE.sm,
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
  rowBlocked: {
    backgroundColor: COLOR.surfaceMuted,
  },
  pressed: {
    opacity: 0.7,
  },
  // Sized to the icon slot it replaces, so rows with and without a swatch align.
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.borderStrong,
  },
  faded: {
    opacity: 0.35,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 15,
    color: COLOR.textSecondary,
  },
  labelActive: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.accent,
  },
  labelBlocked: {
    color: COLOR.textFaint,
  },
  note: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: COLOR.textMuted,
  },
});

export default OptionRow;
