import SortSheet from "@/lib/components/common/DataList/SortSheet";
import {
  applySort,
  cycleCriterion,
  liveCriteria,
  type SortCriterion,
  type SortField,
} from "@/lib/utils/table";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useMemo, useState, type ReactNode } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface DataListProps<T> {
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  /** `index` is the post-sort rank, so a card's ordinal matches what is on screen. */
  renderCard: (row: T, index: number) => ReactNode;
  sortFields?: SortField<T>[];
  onRowPress?: (row: T) => void;
  /** Left side of the toolbar; defaults to a plain "N results". */
  countLabel?: (count: number) => string;
  empty?: ReactNode;
  /** Scrolls away above the first card. Page-level controls belong outside DataList. */
  header?: ReactNode;
}

const defaultCountLabel = (count: number) => `${count} result${count === 1 ? "" : "s"}`;

/**
 * The native stand-in for the web build's antd table: one card per row instead of
 * a horizontally scrolled grid of columns, with sorting moved off the (absent)
 * column headers into a bottom sheet.
 */
const DataList = <T,>({
  data,
  keyExtractor,
  renderCard,
  sortFields = [],
  onRowPress,
  countLabel = defaultCountLabel,
  empty,
  header,
}: DataListProps<T>) => {
  const [criteria, setCriteria] = useState<SortCriterion[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Switching a view's filter swaps its sort fields, which can strand a criterion.
  const active = useMemo(() => liveCriteria(criteria, sortFields), [criteria, sortFields]);
  const sorted = useMemo(() => applySort(data, active, sortFields), [data, active, sortFields]);

  const labelOf = (key: string) => sortFields.find((field) => field.key === key)?.label ?? key;

  const renderItem = ({ item, index }: { item: T; index: number }) => {
    const card = renderCard(item, index);
    if (!onRowPress) return <View style={styles.item}>{card}</View>;

    return (
      <Pressable
        onPress={() => onRowPress(item)}
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        android_ripple={{ color: "#dbeafe" }}
        accessibilityRole="button"
      >
        {card}
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      {sortFields.length > 0 && (
        <View style={styles.toolbar}>
          <View style={styles.toolbarRow}>
            <Text style={styles.count}>{countLabel(sorted.length)}</Text>
            <Pressable
              onPress={() => setSheetOpen(true)}
              style={({ pressed }) => [
                styles.sortButton,
                active.length > 0 && styles.sortButtonActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                active.length > 0 ? `Sort, ${active.length} applied` : "Sort this list"
              }
            >
              <Ionicons
                name="swap-vertical"
                size={16}
                color={active.length > 0 ? "#ffffff" : "#334155"}
              />
              <Text style={[styles.sortLabel, active.length > 0 && styles.sortLabelActive]}>
                Sort{active.length > 0 ? ` · ${active.length}` : ""}
              </Text>
            </Pressable>
          </View>

          {active.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {active.map((criterion, index) => (
                <Pressable
                  key={criterion.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCriteria(cycleCriterion(active, criterion.key));
                  }}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`${labelOf(criterion.key)}, ${
                    criterion.order === "ascend" ? "ascending" : "descending"
                  }. Tap to change.`}
                >
                  {active.length > 1 && <Text style={styles.chipRank}>{index + 1}</Text>}
                  <Text style={styles.chipLabel}>{labelOf(criterion.key)}</Text>
                  <Ionicons
                    name={criterion.order === "ascend" ? "arrow-up" : "arrow-down"}
                    size={13}
                    color="#0369a1"
                  />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <FlatList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={header ? <>{header}</> : null}
        ListEmptyComponent={empty ? <>{empty}</> : null}
        contentContainerStyle={sorted.length === 0 ? styles.contentEmpty : styles.content}
        initialNumToRender={12}
        windowSize={9}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />

      <SortSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        fields={sortFields}
        criteria={active}
        onChange={setCriteria}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: "#f5f5f4",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  count: {
    flex: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    color: "#64748b",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  sortButtonActive: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  sortLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: "#334155",
  },
  sortLabelActive: {
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.7,
  },
  chips: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
  },
  chipRank: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 11,
    color: "#0284c7",
  },
  chipLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: "#0c4a6e",
  },
  content: {
    padding: 16,
    gap: 10,
  },
  contentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  item: {
    borderRadius: 14,
  },
  itemPressed: {
    opacity: 0.85,
  },
});

export default DataList;
export { default as DataCard } from "@/lib/components/common/DataList/DataCard";
export type { DataField } from "@/lib/components/common/DataList/DataCard";
