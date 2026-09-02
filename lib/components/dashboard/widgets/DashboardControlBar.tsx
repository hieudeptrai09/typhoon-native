import EdgeFade from "@/lib/components/common/EdgeFade";
import {
  filterLabelFor,
  filterOptionsFor,
  METRIC_OPTIONS,
  MODE_OPTIONS,
  optionFor,
  VIEW_TABS,
} from "@/lib/components/dashboard/options";
import ViewOptionsSheet, {
  type OptionAxis,
} from "@/lib/components/dashboard/widgets/ViewOptionsSheet";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { DashboardParams, SegmentOption } from "@/lib/types";
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

const AxisChip = ({ option, onPress }: { option: SegmentOption; onPress: () => void }) => (
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

const DashboardControlBar = ({ params, onChange, onSelectView }: DashboardControlBarProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { view, metric, filter, mode } = params;

  const openSheet = () => {
    Haptics.selectionAsync();
    setSheetOpen(true);
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

  const chipOptions = [
    view === "stats" ? optionFor(METRIC_OPTIONS, metric) : undefined,
    optionFor(filterOptions, filter),
    optionFor(MODE_OPTIONS, mode),
  ].filter((option): option is SegmentOption => option !== undefined);

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

      <EdgeFade style={styles.rail} contentContainerStyle={styles.railContent}>
        {chipOptions.map((option) => (
          <AxisChip key={option.value} option={option} onPress={openSheet} />
        ))}
      </EdgeFade>

      <ViewOptionsSheet open={sheetOpen} onClose={() => setSheetOpen(false)} axes={axes} />
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
  rail: {
    flexGrow: 0,
  },
  railContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
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

export default DashboardControlBar;
