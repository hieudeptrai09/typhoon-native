import {
  DASHBOARD_ICON_MAP,
  FILTER_OPTIONS,
  getFilterLabel,
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

const DashboardControlBar = ({ params, onChange, onSelectView }: DashboardControlBarProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { view, filter, mode } = params;

  const viewLabel = VIEW_TABS.find((tab) => tab.key === view)?.label ?? "";

  const filterOptions = FILTER_OPTIONS[view] ?? [];
  const activeFilter = filterOptions.find((option) => option.value === filter) ?? filterOptions[0];
  const filterLabel = getFilterLabel(view);
  const pillLabel = activeFilter?.shortLabel ?? activeFilter?.label ?? filter;

  const layoutLocked = isGridOnly(view, filter) || isListOnly(view, filter);
  const modeLabel = MODE_OPTIONS.find((option) => option.value === mode)?.label;

  return (
    <View style={styles.root}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {VIEW_TABS.map(({ key, label }) => {
          const isActive = view === key;

          return (
            <View key={key} style={styles.slot}>
              <Pressable
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
                hitSlop={4}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                // The glyph carries no name of its own, so the label has to come from here; it is
                // spelled out under the strip for everyone else.
                accessibilityLabel={label}
              >
                <Ionicons
                  name={DASHBOARD_ICON_MAP.view[key]}
                  size={20}
                  color={isActive ? COLOR.textInverse : COLOR.textBody}
                />
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.summary}>
        <View style={styles.headingRow}>
          <Text style={styles.title} numberOfLines={1}>
            {viewLabel}
          </Text>

          <Pressable
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [styles.options, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`View options. ${filterLabel}: ${activeFilter?.label ?? filter}${
              layoutLocked ? "" : `, ${modeLabel} layout`
            }`}
          >
            {activeFilter?.swatch ? (
              <View style={[styles.swatch, { backgroundColor: activeFilter.swatch }]} />
            ) : (
              activeFilter?.icon && (
                <Ionicons name={activeFilter.icon} size={15} color={COLOR.accent} />
              )
            )}
            <Text style={styles.optionsLabel} numberOfLines={1}>
              {pillLabel}
              {layoutLocked ? "" : ` · ${modeLabel}`}
            </Text>
            <Ionicons name="chevron-down" size={14} color={COLOR.accent} />
          </Pressable>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {VIEW_DESCRIPTION[view]}
        </Text>
      </View>

      <ViewOptionsSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filterOptions={filterOptions}
        filterLabel={filterLabel}
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
    gap: SPACE.md,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.borderStrong,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACE.lg,
  },
  // Every tab is the same width whether or not it is selected, so the strip never scrolls, never
  // reflows, and needs no layout animation. The slot spreads the row's slack evenly; the circle
  // inside keeps a fixed size, so it stays round on a wide screen instead of stretching.
  slot: {
    flex: 1,
    alignItems: "center",
  },
  tab: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
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
  summary: {
    gap: 2,
    paddingHorizontal: SPACE.lg,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
  },
  // Names the icon that is lit above it: the strip itself is wordless, so this is the only place
  // the current view is spelled out.
  title: {
    flex: 1,
    fontFamily: "OpenSans_700Bold",
    fontSize: 18,
    color: COLOR.text,
  },
  description: {
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
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.borderStrong,
  },
  optionsLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
});

export default DashboardControlBar;
