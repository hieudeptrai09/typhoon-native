import IndexBar from "@/lib/components/common/DataList/IndexBar";
import { useSortMemory } from "@/lib/components/common/DataList/sortMemory";
import SortSheet from "@/lib/components/common/DataList/SortSheet";
import EdgeFade from "@/lib/components/common/EdgeFade";
import { useRefreshControl } from "@/lib/components/common/RefreshContext";
import { COLOR, SPACE } from "@/lib/constants/theme";
import {
  applySort,
  cycleCriterion,
  liveCriteria,
  type SortCriterion,
  type SortField,
  type SortKey,
} from "@/lib/utils/table";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

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
  /** Names this list's sort so it survives the view being switched away and back. */
  sortKey?: string;
  /** Order applied before the user touches anything. */
  defaultSort?: SortCriterion[];
  /**
   * Turns on the alphabet rail, but only while the list is actually ordered by `key` — an index
   * over rows that aren't grouped by their initial would point at the wrong place.
   */
  indexField?: { key: SortKey; letterOf: (row: T) => string };
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
  sortKey,
  defaultSort,
  indexField,
}: DataListProps<T>) => {
  const [criteria, setCriteria] = useSortMemory(sortKey, defaultSort);
  const [sheetOpen, setSheetOpen] = useState(false);
  const refreshControl = useRefreshControl();
  const listRef = useRef<FlatList<T>>(null);

  // Switching a view's filter swaps its sort fields, which can strand a criterion.
  const active = useMemo(() => liveCriteria(criteria, sortFields), [criteria, sortFields]);
  const sorted = useMemo(() => applySort(data, active, sortFields), [data, active, sortFields]);

  const indexed =
    indexField !== undefined && active.length === 1 && active[0].key === indexField.key;
  const letters = useMemo(() => {
    if (!indexed || !indexField) return [];
    const seen: string[] = [];
    for (const row of sorted) {
      const letter = indexField.letterOf(row);
      if (letter !== seen[seen.length - 1]) seen.push(letter);
    }
    return seen;
  }, [indexed, indexField, sorted]);

  const jumpTo = (letter: string) => {
    if (!indexField) return;
    const index = sorted.findIndex((row) => indexField.letterOf(row) === letter);
    if (index >= 0) listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 });
  };

  const labelOf = (key: string) => sortFields.find((field) => field.key === key)?.label ?? key;

  const renderItem = ({ item, index }: { item: T; index: number }) => {
    const card = renderCard(item, index);
    if (!onRowPress) return <View style={styles.item}>{card}</View>;

    return (
      <Pressable
        onPress={() => onRowPress(item)}
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        android_ripple={{ color: COLOR.accentSoft }}
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
                color={active.length > 0 ? COLOR.textInverse : COLOR.textSecondary}
              />
              <Text style={[styles.sortLabel, active.length > 0 && styles.sortLabelActive]}>
                Sort{active.length > 0 ? ` · ${active.length}` : ""}
              </Text>
            </Pressable>
          </View>

          {active.length > 0 && (
            <EdgeFade contentContainerStyle={styles.chips}>
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
                    color={COLOR.accent}
                  />
                </Pressable>
              ))}
            </EdgeFade>
          )}
        </View>
      )}

      <View style={styles.body}>
        <FlatList
          ref={listRef}
          data={sorted}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={header ? <>{header}</> : null}
          ListEmptyComponent={empty ? <>{empty}</> : null}
          contentContainerStyle={[
            sorted.length === 0 ? styles.contentEmpty : styles.content,
            indexed && letters.length > 1 && styles.contentIndexed,
          ]}
          refreshControl={refreshControl}
          initialNumToRender={12}
          windowSize={9}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          // Scrolling a list while a keyboard covers half of it is the search screen's default
          // state; the drag itself is the signal that the user is done typing.
          keyboardDismissMode="on-drag"
          // Cards vary in height, so a jump far down the list can land before its target has been
          // measured. Fall back to the estimate, then land the jump on the next frame.
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            listRef.current?.scrollToOffset({ offset: index * averageItemLength, animated: false });
            requestAnimationFrame(() =>
              listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 }),
            );
          }}
        />

        {indexed && <IndexBar letters={letters} onSelect={jumpTo} />}
      </View>

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
    backgroundColor: COLOR.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.border,
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
    color: COLOR.textMuted,
  },
  sortButton: {
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
  sortButtonActive: {
    backgroundColor: COLOR.accent,
    borderColor: COLOR.accent,
  },
  sortLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textSecondary,
  },
  sortLabelActive: {
    color: COLOR.textInverse,
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
    backgroundColor: COLOR.accentSoft,
  },
  chipRank: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 11,
    color: COLOR.accent,
  },
  chipLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: SPACE.lg,
    paddingBottom: SPACE.xxl,
    gap: 10,
  },
  /** Clears the alphabet rail so a card's right edge never runs under it. */
  contentIndexed: {
    paddingRight: SPACE.lg + 20,
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
