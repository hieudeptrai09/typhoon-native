import EdgeFade from "@/lib/components/common/EdgeFade";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import type { FilterChip } from "@/lib/utils/name/filters";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NamesToolbarProps {
  /** Omitted in a scope with only one layout, so a dead control never costs a tap to discover. */
  options?: { label: string; icon: IconName; onPress: () => void };
  chips: FilterChip[];
  onOpenFilters: () => void;
  onRemoveChip: (key: string) => void;
}

/**
 * One toolbar for all three scopes. It used to be built inline in each view, which is how the
 * filter button ended up in a different place depending on which tab you were on.
 */
const NamesToolbar = ({ options, chips, onOpenFilters, onRemoveChip }: NamesToolbarProps) => (
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
      ) : (
        <View style={styles.spacer} />
      )}

      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onOpenFilters();
        }}
        style={({ pressed }) => [
          styles.filter,
          chips.length > 0 && styles.filterActive,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          chips.length > 0 ? `Filters, ${chips.length} applied` : "Filter these names"
        }
      >
        <Ionicons
          name="funnel-outline"
          size={16}
          color={chips.length > 0 ? COLOR.textInverse : COLOR.textSecondary}
        />
        <Text style={[styles.filterLabel, chips.length > 0 && styles.filterLabelActive]}>
          Filter{chips.length > 0 ? ` · ${chips.length}` : ""}
        </Text>
      </Pressable>
    </View>

    {/* Which filters are on, not just how many — reading that off a badge meant reopening the
        modal, and removing one of them meant editing a multi-select to get back out. */}
    {chips.length > 0 && (
      <EdgeFade contentContainerStyle={styles.chips}>
        {chips.map((chip) => (
          <Pressable
            key={chip.key}
            onPress={() => {
              Haptics.selectionAsync();
              onRemoveChip(chip.key);
            }}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`${chip.label} filter. Tap to remove.`}
          >
            <Text style={styles.chipLabel} numberOfLines={1}>
              {chip.label}
            </Text>
            <Ionicons name="close" size={13} color={COLOR.accent} />
          </Pressable>
        ))}
      </EdgeFade>
    )}
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: SPACE.sm,
    paddingBottom: SPACE.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    paddingHorizontal: SPACE.lg,
  },
  spacer: {
    flex: 1,
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
  filter: {
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
  filterActive: {
    backgroundColor: COLOR.accent,
    borderColor: COLOR.accent,
  },
  filterLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textSecondary,
  },
  filterLabelActive: {
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
    maxWidth: 200,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: COLOR.accentSoft,
  },
  chipLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
});

export default NamesToolbar;
