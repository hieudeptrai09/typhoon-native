import DefModal from "@/lib/components/common/DefModal";
import { COLOR } from "@/lib/constants/theme";
import { cycleCriterion, type SortCriterion, type SortField } from "@/lib/utils/table";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SortSheetProps<T> {
  open: boolean;
  onClose: () => void;
  fields: SortField<T>[];
  criteria: SortCriterion[];
  onChange: (criteria: SortCriterion[]) => void;
}

const SortSheet = <T,>({ open, onClose, fields, criteria, onChange }: SortSheetProps<T>) => {
  const handleToggle = (key: string) => {
    Haptics.selectionAsync();
    onChange(cycleCriterion(criteria, key));
  };

  return (
    <DefModal
      open={open}
      onClose={onClose}
      title="Sort"
      footer={
        <View style={styles.footer}>
          <Pressable
            onPress={() => onChange([])}
            disabled={criteria.length === 0}
            style={styles.clear}
            accessibilityRole="button"
            accessibilityState={{ disabled: criteria.length === 0 }}
          >
            <Text style={[styles.clearText, criteria.length === 0 && styles.clearDisabled]}>
              Clear all
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.done} accessibilityRole="button">
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      }
    >
      <Text style={styles.hint}>
        Tap a field to sort ascending, again for descending, again to remove. Add more than one to
        break ties.
      </Text>

      <View style={styles.list}>
        {fields.map((field) => {
          const rank = criteria.findIndex((criterion) => criterion.key === field.key);
          const criterion = rank === -1 ? undefined : criteria[rank];

          return (
            <Pressable
              key={field.key}
              onPress={() => handleToggle(field.key)}
              style={({ pressed }) => [
                styles.row,
                criterion && styles.rowActive,
                pressed && styles.rowPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: Boolean(criterion) }}
              accessibilityLabel={
                criterion
                  ? `${field.label}, sorted ${criterion.order === "ascend" ? "ascending" : "descending"}, priority ${rank + 1}`
                  : `${field.label}, not sorted`
              }
            >
              <View style={[styles.rank, criterion && styles.rankActive]}>
                {criterion ? (
                  <Text style={styles.rankText}>{rank + 1}</Text>
                ) : (
                  <Ionicons name="ellipse-outline" size={12} color={COLOR.disabled} />
                )}
              </View>

              <Text style={[styles.label, criterion && styles.labelActive]} numberOfLines={1}>
                {field.label}
              </Text>

              {criterion ? (
                <Ionicons
                  name={criterion.order === "ascend" ? "arrow-up" : "arrow-down"}
                  size={18}
                  color={COLOR.accent}
                />
              ) : (
                <Ionicons name="swap-vertical" size={18} color={COLOR.disabled} />
              )}
            </Pressable>
          );
        })}
      </View>
    </DefModal>
  );
};

const styles = StyleSheet.create({
  hint: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: COLOR.textMuted,
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLOR.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  rowActive: {
    backgroundColor: COLOR.accentSoft,
    borderColor: COLOR.accentBorder,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rankActive: {
    backgroundColor: COLOR.accent,
  },
  rankText: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 12,
    color: COLOR.textInverse,
  },
  label: {
    flex: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 15,
    color: COLOR.textSecondary,
  },
  labelActive: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.accent,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  clear: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  clearText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.danger,
  },
  clearDisabled: {
    color: COLOR.disabled,
  },
  done: {
    minWidth: 110,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLOR.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textInverse,
  },
});

export default SortSheet;
