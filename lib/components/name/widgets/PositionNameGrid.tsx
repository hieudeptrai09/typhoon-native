import CountryFlag from "@/lib/components/common/CountryFlag";
import EmptyResults from "@/lib/components/common/EmptyResults";
import { TagIcon } from "@/lib/components/name/widgets/TagIcon";
import CountryPager from "@/lib/components/position/CountryPager";
import PositionRow from "@/lib/components/position/PositionRow";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const sortByOldest = (names: TyphoonName[]) => [...names].sort((a, b) => a.id - b.id);

interface PositionNameGridProps {
  names: TyphoonName[];
  showName: boolean;
  showHistory: boolean;
  // A filtered set is scattered across the 14 country pages, so it is listed instead of paged.
  isFiltered: boolean;
  onCellPress: (position: number, names: TyphoonName[]) => void;
}

const PositionNameGrid = ({
  names,
  showName,
  showHistory,
  isFiltered,
  onCellPress,
}: PositionNameGridProps) => {
  const namesByPosition = useMemo(
    () =>
      names.reduce<Record<number, TyphoonName[]>>((acc, name) => {
        (acc[name.position] ??= []).push(name);
        return acc;
      }, {}),
    [names],
  );

  // Ascending position is the naming table read left to right, top to bottom — the order the
  // committee actually assigns names in.
  const matchedPositions = useMemo(
    () =>
      Object.keys(namesByPosition)
        .map(Number)
        .sort((a, b) => a - b),
    [namesByPosition],
  );

  // Deliberately not pressable: the row underneath is the target, and two nested targets a few
  // pixels apart would be a coin toss.
  const renderName = (name: TyphoonName) => (
    <View key={name.id} style={styles.name}>
      {showName ? (
        <Text style={[styles.nameText, { color: getNameStatusColor(name) }]}>{name.name}</Text>
      ) : (
        <View style={styles.tagRow}>
          <TagIcon tag={name.tag} />
          <Text style={styles.tagLabel}>{name.tag}</Text>
        </View>
      )}
    </View>
  );

  const renderPositionNames = (positionNames: TyphoonName[]) =>
    showHistory ? (
      <View style={styles.history}>{sortByOldest(positionNames).map(renderName)}</View>
    ) : (
      renderName(positionNames[0])
    );

  // Otherwise a filter that matches nothing leaves fourteen pages of dashes to swipe through.
  if (names.length === 0) return <EmptyResults />;

  if (isFiltered) {
    return (
      <FlatList
        data={matchedPositions}
        keyExtractor={String}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        windowSize={9}
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {names.length} name{names.length === 1 ? "" : "s"} in {matchedPositions.length} position
            {matchedPositions.length === 1 ? "" : "s"}
          </Text>
        }
        renderItem={({ item: position }) => {
          const positionNames = namesByPosition[position];

          return (
            <PositionRow
              position={position}
              enabled
              onPress={() => onCellPress(position, positionNames)}
            >
              {renderPositionNames(positionNames)}
              <CountryFlag country={positionNames[0].country} size={14} showName />
            </PositionRow>
          );
        }}
      />
    );
  }

  return (
    <CountryPager
      positionEnabled={(position) => (namesByPosition[position]?.length ?? 0) > 0}
      onPositionPress={(position) => onCellPress(position, namesByPosition[position] ?? [])}
      renderPosition={(position) => {
        const positionNames = namesByPosition[position] ?? [];
        if (positionNames.length === 0) return <Text style={styles.empty}>—</Text>;

        return renderPositionNames(positionNames);
      }}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: SPACE.lg,
    paddingBottom: SPACE.xxl,
    gap: SPACE.sm,
  },
  listHeader: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    color: COLOR.textMuted,
    paddingBottom: SPACE.xs,
  },
  history: {
    gap: 4,
  },
  name: {
    minHeight: 32,
    justifyContent: "center",
  },
  nameText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagLabel: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    color: COLOR.textBody,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.disabled,
  },
});

export default PositionNameGrid;
