import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type CalendarScope = "started" | "ended" | "active" | "todate";

export const CALENDAR_SCOPES: { key: CalendarScope; label: string; icon: IconName }[] = [
  { key: "started", label: "Started", icon: "play-outline" },
  { key: "ended", label: "Ended", icon: "stop-outline" },
  // Not "Active": the Today tab spends that word on storms happening right now.
  { key: "active", label: "Ongoing", icon: "water-outline" },
  { key: "todate", label: "Pace", icon: "stats-chart-outline" },
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
          <Ionicons name={icon} size={14} color={isActive ? COLOR.accent : COLOR.textMuted} />
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

export default CalendarScopeTabs;
