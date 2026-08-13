import EdgeFade from "@/lib/components/common/EdgeFade";
import {
  DASHBOARD_ICON_MAP,
  FILTER_OPTIONS,
  MODE_OPTIONS,
  VIEW_DESCRIPTION,
  VIEW_TABS,
} from "@/lib/components/dashboard/options";
import ViewOptionsSheet from "@/lib/components/dashboard/widgets/ViewOptionsSheet";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { DashboardParams } from "@/lib/types";
import { isGridOnly, isListOnly, paramsForFilter } from "@/lib/utils/storm/routing";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DashboardControlBarProps {
  params: DashboardParams;
  onChange: (params: DashboardParams) => void;
  onSelectView: (view: string) => void;
}

// On web each view was a <Link> so it could be indexed; here the dashboard owns its params as
// state, so these are plain buttons that swap the view in place.
const DashboardControlBar = ({ params, onChange, onSelectView }: DashboardControlBarProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { view, filter, mode } = params;

  const filterOptions = FILTER_OPTIONS[view] ?? [];
  const activeFilter = filterOptions.find((option) => option.value === filter) ?? filterOptions[0];

  // A layout the view cannot honour is dropped rather than shown greyed out: a dead control still
  // costs a tap to discover it is dead.
  const layoutLocked = isGridOnly(view, filter) || isListOnly(view, filter);
  const modeLabel = MODE_OPTIONS.find((option) => option.value === mode)?.label;

  return (
    <View style={styles.root}>
      <EdgeFade contentContainerStyle={styles.tabs} accessibilityRole="tablist">
        {VIEW_TABS.map(({ key, label }) => {
          const isActive = view === key;

          return (
            <Pressable
              key={key}
              onPress={() => {
                if (isActive) return;
                Haptics.selectionAsync();
                onSelectView(key);
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
              <Ionicons
                name={DASHBOARD_ICON_MAP.view[key]}
                size={15}
                color={isActive ? COLOR.textInverse : COLOR.textBody}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </EdgeFade>

      <View style={styles.summary}>
        <Text style={styles.description} numberOfLines={2}>
          {VIEW_DESCRIPTION[view]}
        </Text>

        <Pressable
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [styles.options, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`View options. Grouped by ${activeFilter?.label ?? filter}${
            layoutLocked ? "" : `, ${modeLabel} layout`
          }`}
        >
          {activeFilter?.icon && (
            <Ionicons name={activeFilter.icon} size={15} color={COLOR.accent} />
          )}
          <Text style={styles.optionsLabel} numberOfLines={1}>
            {activeFilter?.label ?? filter}
            {layoutLocked ? "" : ` · ${modeLabel}`}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLOR.accent} />
        </Pressable>
      </View>

      <ViewOptionsSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filterOptions={filterOptions}
        filter={filter}
        onFilterChange={(next) => onChange(paramsForFilter(view, next, mode))}
        modeOptions={layoutLocked ? undefined : MODE_OPTIONS}
        mode={mode}
        onModeChange={(next) => onChange({ view, filter, mode: next })}
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
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
  },
  tabActive: {
    backgroundColor: COLOR.accent,
    borderColor: COLOR.accent,
  },
  pressed: {
    opacity: 0.6,
  },
  tabLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textBody,
  },
  tabLabelActive: {
    color: COLOR.textInverse,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    paddingHorizontal: SPACE.lg,
  },
  description: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: COLOR.textMuted,
  },
  options: {
    flexShrink: 0,
    maxWidth: "55%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: COLOR.accentSoft,
    borderWidth: 1,
    borderColor: COLOR.accentBorder,
  },
  optionsLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
});

export default DashboardControlBar;
