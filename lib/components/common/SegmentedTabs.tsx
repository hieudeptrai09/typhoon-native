import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface SegmentedTab<T extends string> {
  key: T;
  label: string;
  icon?: IconName;
}

interface SegmentedTabsProps<T extends string> {
  tabs: SegmentedTab<T>[];
  active: T;
  onChange: (key: T) => void;
}

const SegmentedTabs = <T extends string>({ tabs, active, onChange }: SegmentedTabsProps<T>) => (
  <View style={styles.root} accessibilityRole="tablist">
    {tabs.map(({ key, label, icon }) => {
      const isActive = active === key;

      return (
        <Pressable
          key={key}
          onPress={() => {
            if (isActive) return;
            Haptics.selectionAsync();
            onChange(key);
          }}
          style={({ pressed }) => [
            styles.tab,
            isActive && styles.tabActive,
            pressed && !isActive && styles.pressed,
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={label}
        >
          {icon && (
            <Ionicons name={icon} size={14} color={isActive ? COLOR.accent : COLOR.textMuted} />
          )}
          <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
            {label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: SPACE.xs,
    padding: SPACE.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLOR.surfaceSunken,
  },
  tab: {
    // minWidth releases the content-based floor, or the widest label pushes the rest off the row.
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 38,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: COLOR.surface,
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
});

export default SegmentedTabs;
