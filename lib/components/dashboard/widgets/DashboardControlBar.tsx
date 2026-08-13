import SegmentedControl from "@/lib/components/common/SegmentedControl";
import {
  DASHBOARD_ICON_MAP,
  FILTER_OPTIONS,
  MODE_OPTIONS,
} from "@/lib/components/dashboard/options";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { DashboardParams } from "@/lib/types";
import { isGridOnly, isListOnly, paramsForFilter, paramsForView } from "@/lib/utils/storm/routing";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const VIEW_TABS: { key: string; label: string }[] = [
  { key: "all", label: "Storms" },
  { key: "highlights", label: "Highlights" },
  { key: "average", label: "Average" },
  { key: "recurrence", label: "Recurrence" },
  { key: "avgdate", label: "Avg. Date" },
];

interface DashboardControlBarProps {
  params: DashboardParams;
  onChange: (params: DashboardParams) => void;
}

// On web each view was a <Link> so it could be indexed; here the dashboard owns its params as
// state, so these are plain buttons that swap the view in place.
const DashboardControlBar = ({ params, onChange }: DashboardControlBarProps) => {
  const { view, filter, mode } = params;
  const filterOptions = FILTER_OPTIONS[view] ?? [];

  const modeOptions = MODE_OPTIONS.map((option) => ({
    ...option,
    disabled:
      (option.value === "table" && isListOnly(view, filter)) ||
      (option.value === "list" && isGridOnly(view, filter)),
  }));

  return (
    <View style={styles.root}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        accessibilityRole="tablist"
      >
        {VIEW_TABS.map(({ key, label }) => {
          const isActive = view === key;

          return (
            <Pressable
              key={key}
              onPress={() => {
                if (isActive) return;
                Haptics.selectionAsync();
                onChange(paramsForView(key));
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
      </ScrollView>

      <View style={styles.controls}>
        <View style={styles.controlHead}>
          <Text style={styles.controlLabel}>Group by</Text>
          <View style={styles.modeSlot}>
            <SegmentedControl
              options={modeOptions}
              value={mode}
              onChange={(next) => onChange({ view, filter, mode: next })}
              accessibilityLabel="Select display mode"
            />
          </View>
        </View>

        <SegmentedControl
          scrollable
          options={filterOptions}
          value={filter || filterOptions[0]?.value}
          onChange={(next) => onChange(paramsForFilter(view, next, mode))}
          accessibilityLabel="Select grouping option"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: SPACE.md,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.md,
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
  controls: {
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
  },
  controlHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACE.md,
  },
  modeSlot: {
    flexShrink: 1,
  },
  controlLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.textMuted,
  },
});

export default DashboardControlBar;
