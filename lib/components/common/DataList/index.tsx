import { useSortMemory } from "@/lib/components/common/DataList/sortMemory";
import SortSheet from "@/lib/components/common/DataList/SortSheet";
import ListControls, { type ControlChip } from "@/lib/components/common/ListControls";
import { useRefreshControl } from "@/lib/components/common/RefreshContext";
import { type OptionAxis } from "@/lib/components/common/ViewOptionsSheet";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import {
  applySort,
  cycleCriterion,
  liveCriteria,
  type SortCriterion,
  type SortField,
} from "@/lib/utils/table";
import { useMemo, useState, type ReactNode } from "react";
import { FlatList, Pressable, SectionList, StyleSheet, View } from "react-native";

interface DataListProps<T> {
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  // `index` is the post-sort rank, not the position in `data`.
  renderCard: (row: T, index: number) => ReactNode;
  sortFields?: SortField<T>[];
  onRowPress?: (row: T) => void;
  countLabel?: (count: number) => string;
  empty?: ReactNode;
  header?: ReactNode;
  // Names this list's sort so it survives the view being switched away and back.
  sortKey?: string;
  defaultSort?: SortCriterion[];
  filter?: {
    chips: { key: string; label: string }[];
    onOpen: () => void;
    onRemoveChip: (key: string) => void;
  };
  axes?: OptionAxis[];
  // Scrolls the toolbar with the header and pins it once it reaches the top, for screens whose
  // header is tall enough that a toolbar above it would sit far from the rows it sorts.
  stickyToolbar?: boolean;
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
  filter,
  axes,
  stickyToolbar = false,
}: DataListProps<T>) => {
  const [criteria, setCriteria] = useSortMemory(sortKey, defaultSort);
  const [sheetOpen, setSheetOpen] = useState(false);
  const refreshControl = useRefreshControl();

  // Switching a view's filter swaps its sort fields, which can strand a criterion.
  const active = useMemo(() => liveCriteria(criteria, sortFields), [criteria, sortFields]);
  const sorted = useMemo(() => applySort(data, active, sortFields), [data, active, sortFields]);

  const labelOf = (key: string) => sortFields.find((field) => field.key === key)?.label ?? key;

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

  const hasControls = sortFields.length > 0 || filter !== undefined || axes !== undefined;

  const controls = (
    <ListControls
      count={countLabel(sorted.length)}
      axes={axes}
      filter={filter ? { count: filter.chips.length, onPress: filter.onOpen } : undefined}
      sort={
        sortFields.length > 0
          ? { count: active.length, onPress: () => setSheetOpen(true) }
          : undefined
      }
      chips={chips}
    />
  );

  const listProps = {
    keyExtractor,
    renderItem,
    ListHeaderComponent: header ? <>{header}</> : null,
    ListEmptyComponent: empty ? <>{empty}</> : null,
    contentContainerStyle: sorted.length === 0 ? styles.contentEmpty : styles.content,
    refreshControl,
    initialNumToRender: 12,
    windowSize: 9,
    removeClippedSubviews: true,
    keyboardShouldPersistTaps: "handled" as const,
    keyboardDismissMode: "on-drag" as const,
  };

  return (
    <View style={styles.root}>
      {hasControls && !stickyToolbar && <View style={styles.toolbar}>{controls}</View>}

      <View style={styles.body}>
        {stickyToolbar ? (
          <SectionList<T>
            {...listProps}
            // No section at all when empty: a lone section would keep ListEmptyComponent hidden.
            sections={sorted.length > 0 ? [{ data: sorted }] : []}
            renderSectionHeader={() =>
              hasControls ? (
                <View style={[styles.toolbar, styles.toolbarPinned]}>{controls}</View>
              ) : null
            }
            stickySectionHeadersEnabled
          />
        ) : (
          <FlatList {...listProps} data={sorted} />
        )}
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
  // Cancels the list's gutter so the pinned bar spans edge to edge and hides the rows beneath it.
  toolbarPinned: {
    marginHorizontal: -SPACE.lg,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: SPACE.lg,
    paddingBottom: SPACE.xxl,
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
