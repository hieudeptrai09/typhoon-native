import * as Haptics from "expo-haptics";
import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface Tab<T extends string = string> {
  key: T;
  label: string;
  content: ReactNode;
}

interface TabsProps<T extends string = string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

// The web build kept every panel mounted and hid the inactive ones so their scroll position
// survived. Native renders only the active panel: these panels sit inside a sheet that unmounts
// anyway, and keeping images on all of them alive costs more than the state is worth.
const Tabs = <T extends string = string>({ tabs, activeTab, onTabChange }: TabsProps<T>) => {
  const active = tabs.find((tab) => tab.key === activeTab);

  return (
    <View style={styles.root}>
      <View style={styles.bar} accessibilityRole="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                if (isActive) return;
                Haptics.selectionAsync();
                onTabChange(tab.key);
              }}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.tabActive,
                pressed && !isActive && styles.pressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.panel}>{active?.content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "column",
  },
  bar: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 36,
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
  panel: {
    marginTop: 16,
  },
});

export default Tabs;
