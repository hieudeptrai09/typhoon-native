import AxisChipRail from "@/lib/components/common/AxisChip";
import ViewOptionsSheet, { type OptionAxis } from "@/lib/components/common/ViewOptionsSheet";
import {
  filterLabelFor,
  filterOptionsFor,
  METRIC_OPTIONS,
  MODE_OPTIONS,
  VIEW_TABS,
} from "@/lib/components/dashboard/options";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { DashboardParams } from "@/lib/types";
import {
  groupBlockedReason,
  layoutBlockedReason,
  normalizeParams,
} from "@/lib/utils/storm/routing";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DashboardControlBarProps {
  params: DashboardParams;
  onChange: (params: DashboardParams) => void;
  onSelectView: (view: string) => void;
}

const DashboardControlBar = ({ params, onChange, onSelectView }: DashboardControlBarProps) => {
  const [sheetAxis, setSheetAxis] = useState<string>();
  const { view, metric, filter, mode } = params;

  // The tapped chip picks the tab the sheet opens on, so a chip never lands on an unrelated axis.
  const openSheet = (axis: string) => {
    Haptics.selectionAsync();
    setSheetAxis(axis);
  };

  const apply = (next: Partial<DashboardParams>) =>
    onChange(normalizeParams({ ...params, ...next }));

  const filterOptions = filterOptionsFor(view);
  const filterLabel = filterLabelFor(view);

  const axes: OptionAxis[] = [];
  if (view === "stats") {
    axes.push({
      label: "Metric",
      options: METRIC_OPTIONS,
      value: metric,
      onChange: (next) => apply({ metric: next }),
    });
  }
  axes.push({
    label: filterLabel,
    options: filterOptions.map((option) => ({
      ...option,
      blockedReason: groupBlockedReason(view, metric, option.value, mode) ?? undefined,
    })),
    value: filter,
    onChange: (next) => apply({ filter: next }),
  });
  axes.push({
    label: "Layout",
    options: MODE_OPTIONS.map((option) => ({
      ...option,
      blockedReason: layoutBlockedReason(view, filter, option.value) ?? undefined,
    })),
    value: mode,
    onChange: (next) => apply({ mode: next }),
  });

  return (
    <View style={styles.root}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {VIEW_TABS.map((tab) => {
          const isActive = view === tab.value;

          return (
            <Pressable
              key={tab.value}
              onPress={() => {
                if (isActive) return;
                Haptics.selectionAsync();
                onSelectView(tab.value);
              }}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.tabActive,
                pressed && !isActive && styles.pressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              accessibilityHint={tab.description}
            >
              {tab.icon && (
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={isActive ? COLOR.accent : COLOR.textMuted}
                />
              )}
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AxisChipRail
        axes={axes}
        onPress={openSheet}
        style={styles.rail}
        contentContainerStyle={styles.railContent}
      />

      <ViewOptionsSheet
        open={sheetAxis !== undefined}
        onClose={() => setSheetAxis(undefined)}
        axes={axes}
        initialAxis={sheetAxis}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: SPACE.sm,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.borderStrong,
  },
  tabs: {
    flexDirection: "row",
    gap: SPACE.xs,
    marginHorizontal: SPACE.lg,
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
  tabLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.textMuted,
  },
  tabLabelActive: {
    color: COLOR.accent,
  },
  pressed: {
    opacity: 0.6,
  },
  // The rail sits in a column: without this the scroller claims the leftover height.
  rail: {
    flexGrow: 0,
  },
  railContent: {
    paddingHorizontal: SPACE.lg,
  },
});

export default DashboardControlBar;
