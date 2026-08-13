import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type NamesScope = "current" | "history" | "retired";

const TABS: { key: NamesScope; label: string; icon: IconName }[] = [
  { key: "current", label: "Current", icon: "flame-outline" },
  { key: "history", label: "History", icon: "time-outline" },
  { key: "retired", label: "Retired", icon: "skull-outline" },
];

interface NamesScopeTabsProps {
  activeScope: NamesScope;
  onChange: (scope: NamesScope) => void;
}

// Replaces the web <h1>: the native header already says "Names", so the scope is what actually
// needs naming on screen — and here it doubles as the control that changes it.
const NamesScopeTabs = ({ activeScope, onChange }: NamesScopeTabsProps) => (
  <View style={styles.root} accessibilityRole="tablist">
    {TABS.map(({ key, label, icon }) => {
      const isActive = activeScope === key;

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
          <Ionicons name={icon} size={15} color={isActive ? "#0369a1" : "#64748b"} />
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
    gap: 4,
    margin: 12,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
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
    backgroundColor: "#ffffff",
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#64748b",
  },
  labelActive: {
    color: "#0369a1",
  },
});

export default NamesScopeTabs;
