import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type CalendarScope = "started" | "ended" | "active";

export const CALENDAR_SCOPES: { key: CalendarScope; label: string; icon: IconName }[] = [
  { key: "started", label: "Started", icon: "play-outline" },
  { key: "ended", label: "Ended", icon: "stop-outline" },
  { key: "active", label: "Active", icon: "water-outline" },
];

interface CalendarScopeTabsProps {
  scope: CalendarScope;
  onChange: (scope: CalendarScope) => void;
}

const CalendarScopeTabs = ({ scope, onChange }: CalendarScopeTabsProps) => (
  <View style={styles.root} accessibilityRole="tablist">
    {CALENDAR_SCOPES.map(({ key, label, icon }) => {
      const isActive = scope === key;

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
          <Ionicons name={icon} size={15} color={isActive ? COLOR.accent : COLOR.textMuted} />
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
    marginHorizontal: SPACE.lg,
    marginTop: SPACE.md,
    padding: SPACE.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLOR.surfaceSunken,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
    fontSize: 14,
    color: COLOR.textMuted,
  },
  labelActive: {
    color: COLOR.accent,
  },
});

export default CalendarScopeTabs;
