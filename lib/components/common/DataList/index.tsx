import IndexBar from "@/lib/components/common/DataList/IndexBar";
import { useSortMemory } from "@/lib/components/common/DataList/sortMemory";
import SortSheet from "@/lib/components/common/DataList/SortSheet";
import ListControls, { type ControlChip } from "@/lib/components/common/ListControls";
import { useRefreshControl } from "@/lib/components/common/RefreshContext";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import {
  applySort,
  cycleCriterion,
  liveCriteria,
  type SortCriterion,
  type SortField,
  type SortKey,
} from "@/lib/utils/table";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

interface DataListProps<T> {
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  /** `index` is the post-sort rank, so a card's ordinal matches what is on screen. */
  renderCard: (row: T, index: number) => ReactNode;
  sortFields?: SortField<T>[];
  onRowPress?: (row: T) => void;
  countLabel?: (count: number) => string;
  empty?: ReactNode;
  header?: ReactNode;
  /** Names this list's sort so it survives the view being switched away and back. */
  sortKey?: string;
  defaultSort?: SortCriterion[];
  /**
   * Turns on the alphabet rail, but only while the list is actually ordered by `key` — an index
   * over rows that aren't grouped by their initial would point at the wrong place.
   */
  indexField?: { key: SortKey; letterOf: (row: T) => string };
  /**
   * Narrowing stays owned by the view above, but its controls belong in this bar: filter and sort
   * are one question to the reader, so they share one row of buttons and one rail of chips.
   */
  filter?: {
    chips: { key: string; label: string }[];
    onOpen: () => void;
    onRemoveChip: (key: string) => void;
  };
  options?: { label: string; icon: IconName; onPress: () => void };
}

const defaultCountLabel = (count: number) => `${count} result${count === 1 ? "" : "s"}`;

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
  filter,
  options,
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

  // Filter chips lead, sort chips follow: what is in the list, then how it is ordered.
  const chips: ControlChip[] = [
    ...(filter?.chips ?? []).map((chip) => ({
      key: `filter:${chip.key}`,
      label: chip.label,
      icon: "close" as IconName,
      accessibilityLabel: `${chip.label} filter. Tap to remove.`,
      onPress: () => filter?.onRemoveChip(chip.key),
    })),
    ...active.map((criterion, index) => ({
      key: `sort:${criterion.key}`,
      label: labelOf(criterion.key),
      icon: (criterion.order === "ascend" ? "arrow-up" : "arrow-down") as IconName,
      rank: active.length > 1 ? index + 1 : undefined,
      accessibilityLabel: `${labelOf(criterion.key)}, ${
        criterion.order === "ascend" ? "ascending" : "descending"
      }. Tap to change.`,
      onPress: () => setCriteria(cycleCriterion(active, criterion.key)),
    })),
  ];

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

  const hasControls = sortFields.length > 0 || filter !== undefined || options !== undefined;

  return (
    <View style={styles.root}>
      {hasControls && (
        <View style={styles.toolbar}>
          <ListControls
            count={countLabel(sorted.length)}
            options={options}
            filter={filter ? { count: filter.chips.length, onPress: filter.onOpen } : undefined}
            sort={
              sortFields.length > 0
                ? { count: active.length, onPress: () => setSheetOpen(true) }
                : undefined
            }
            chips={chips}
          />
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
    backgroundColor: COLOR.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.border,
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
