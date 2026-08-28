import EdgeFade from "@/lib/components/common/EdgeFade";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface ControlChip {
  key: string;
  label: string;
  /** Trailing glyph: a dismiss cross for a filter, a direction arrow for a sort. */
  icon: IconName;
  /** Shown only where several chips compete, e.g. the priority of a sort criterion. */
  rank?: number;
  accessibilityLabel: string;
  onPress: () => void;
}

interface ControlButton {
  count: number;
  onPress: () => void;
}

interface ListControlsProps {
  /** Leading slot. The options pill wins it when both are given. */
  count?: string;
  options?: { label: string; icon: IconName; onPress: () => void };
  filter?: ControlButton;
  sort?: ControlButton;
  chips?: ControlChip[];
}

const Pill = ({
  icon,
  label,
  count,
  onPress,
  accessibilityLabel,
}: {
  icon: IconName;
  label: string;
  count: number;
  onPress: () => void;
  accessibilityLabel: string;
}) => {
  const active = count > 0;

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={16} color={active ? COLOR.textInverse : COLOR.textSecondary} />
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
        {label}
        {active ? ` · ${count}` : ""}
      </Text>
    </Pressable>
  );
};

const ListControls = ({ count, options, filter, sort, chips = [] }: ListControlsProps) => (
  <View style={styles.root}>
    <View style={styles.row}>
      {options ? (
        <Pressable
          onPress={options.onPress}
          style={({ pressed }) => [styles.options, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`View options, currently ${options.label}`}
        >
          <Ionicons name={options.icon} size={15} color={COLOR.accent} />
          <Text style={styles.optionsLabel} numberOfLines={1}>
            {options.label}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLOR.accent} />
        </Pressable>
      ) : count !== undefined ? (
        <Text style={styles.count} numberOfLines={1}>
          {count}
        </Text>
      ) : (
        <View style={styles.spacer} />
      )}

      {filter && (
        <Pill
          icon="funnel-outline"
          label="Filter"
          count={filter.count}
          onPress={filter.onPress}
          accessibilityLabel={
            filter.count > 0 ? `Filters, ${filter.count} applied` : "Filter this list"
          }
        />
      )}

      {sort && (
        <Pill
          icon="swap-vertical"
          label="Sort"
          count={sort.count}
          onPress={sort.onPress}
          accessibilityLabel={sort.count > 0 ? `Sort, ${sort.count} applied` : "Sort this list"}
        />
      )}
    </View>

    {chips.length > 0 && (
      <EdgeFade contentContainerStyle={styles.chips}>
        {chips.map((chip) => (
          <Pressable
            key={chip.key}
            onPress={() => {
              Haptics.selectionAsync();
              chip.onPress();
            }}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={chip.accessibilityLabel}
          >
            {chip.rank !== undefined && <Text style={styles.chipRank}>{chip.rank}</Text>}
            <Text style={styles.chipLabel} numberOfLines={1}>
              {chip.label}
            </Text>
            <Ionicons name={chip.icon} size={13} color={COLOR.accent} />
          </Pressable>
        ))}
      </EdgeFade>
    )}
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: SPACE.sm,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
  },
  spacer: {
    flex: 1,
  },
  count: {
    flex: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  options: {
    flex: 1,
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
    flex: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLOR.surface,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
  },
  pillActive: {
    backgroundColor: COLOR.accent,
    borderColor: COLOR.accent,
  },
  pillLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textSecondary,
  },
  pillLabelActive: {
    color: COLOR.textInverse,
  },
  pressed: {
    opacity: 0.7,
  },
  chips: {
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: 220,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: COLOR.accentSoft,
  },
  chipRank: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 11,
    color: COLOR.accent,
  },
  chipLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
});

export default ListControls;
