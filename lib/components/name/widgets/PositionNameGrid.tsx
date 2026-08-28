import EmptyResults from "@/lib/components/common/EmptyResults";
import { TagIcon } from "@/lib/components/name/widgets/TagIcon";
import CountryPager from "@/lib/components/position/CountryPager";
import { COLOR } from "@/lib/constants/theme";
import type { TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

const sortByOldest = (names: TyphoonName[]) => [...names].sort((a, b) => a.id - b.id);

interface PositionNameGridProps {
  names: TyphoonName[];
  showName: boolean;
  showHistory: boolean;
  onCellPress: (position: number, names: TyphoonName[]) => void;
}

const PositionNameGrid = ({ names, showName, showHistory, onCellPress }: PositionNameGridProps) => {
  const namesByPosition = useMemo(
    () =>
      names.reduce<Record<number, TyphoonName[]>>((acc, name) => {
        (acc[name.position] ??= []).push(name);
        return acc;
      }, {}),
    [names],
  );

  // Deliberately not pressable on its own. The row underneath is the target: two nested targets a
  // few pixels apart, opening different sheets with nothing to tell them apart, is a coin toss.
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

  // Otherwise a filter that matches nothing leaves fourteen pages of dashes to swipe through
  // before it becomes clear there was nothing to find.
  if (names.length === 0) return <EmptyResults />;

  return (
    <CountryPager
      positionEnabled={(position) => (namesByPosition[position]?.length ?? 0) > 0}
      onPositionPress={(position) => onCellPress(position, namesByPosition[position] ?? [])}
      renderPosition={(position) => {
        const positionNames = namesByPosition[position] ?? [];
        if (positionNames.length === 0) return <Text style={styles.empty}>—</Text>;

        if (!showHistory) return <View>{renderName(positionNames[0])}</View>;

        return <View style={styles.history}>{sortByOldest(positionNames).map(renderName)}</View>;
      }}
    />
  );
};

const styles = StyleSheet.create({
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
