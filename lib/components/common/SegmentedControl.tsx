import { COLOR } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  /** Used wherever the full label would not fit, e.g. the dashboard's filter pill. */
  shortLabel?: string;
  icon?: IconName;
  /** Colour chip drawn in place of `icon`, for options whose colour is the thing being picked. */
  swatch?: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  scrollable?: boolean;
}

const SegmentedControl = <T extends string = string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  scrollable = false,
}: SegmentedControlProps<T>) => {
  const segments = options.map((option) => {
    const isActive = option.value === value;

    return (
      <Pressable
        key={option.value}
        disabled={option.disabled}
        onPress={() => {
          if (isActive) return;
          Haptics.selectionAsync();
          onChange(option.value);
        }}
        style={({ pressed }) => [
          styles.segment,
          !scrollable && styles.segmentFlex,
          isActive && styles.segmentActive,
          option.disabled && styles.segmentDisabled,
          pressed && !isActive && !option.disabled && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={option.label}
        accessibilityState={{ selected: isActive, disabled: option.disabled }}
      >
        {option.icon && (
          <Ionicons
            name={option.icon}
            size={14}
            color={option.disabled ? COLOR.disabled : isActive ? COLOR.accent : COLOR.textMuted}
          />
        )}
        <Text
          style={[styles.label, isActive && styles.labelActive, option.disabled && styles.disabled]}
          numberOfLines={1}
        >
          {option.label}
        </Text>
      </Pressable>
    );
  });

  if (!scrollable) {
    return (
      <View style={styles.root} accessibilityLabel={accessibilityLabel}>
        {segments}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.root}
      accessibilityLabel={accessibilityLabel}
    >
      {segments}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 4,
    padding: 3,
    borderRadius: 11,
    backgroundColor: COLOR.surfaceSunken,
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  segmentFlex: {
    flex: 1,
    paddingHorizontal: 8,
  },
  segmentActive: {
    backgroundColor: COLOR.surface,
  },
  segmentDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  labelActive: {
    color: COLOR.accent,
  },
  disabled: {
    color: COLOR.disabled,
  },
});

export default SegmentedControl;
