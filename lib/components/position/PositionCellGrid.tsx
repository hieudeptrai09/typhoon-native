import CountryFlag, { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import PositionGrid, { type GridCell } from "@/lib/components/position/PositionGrid";
import { GRID_COLS } from "@/lib/constants/position";
import type { Storm } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface PositionCellGridProps {
  stormsData: Storm[];
  renderCell: (position: number) => GridCell;
  /** The cell's value spelled out for the readout — colour alone can't say "6.00 years". */
  renderValue?: (position: number) => string | undefined;
  onPositionPress?: (position: number) => void;
}

const countryOf = (position: number): string => COUNTRY_NAMES[(position - 1) % GRID_COLS] ?? "";

const PositionCellGrid = ({
  stormsData,
  renderCell,
  renderValue,
  onPositionPress,
}: PositionCellGridProps) => {
  const namesByPosition = useMemo(() => {
    const map = new Map<number, string[]>();
    stormsData.forEach((storm) => {
      const names = map.get(storm.position) ?? [];
      if (!names.includes(storm.name)) names.push(storm.name);
      map.set(storm.position, names);
    });
    return map;
  }, [stormsData]);

  const renderReadout = (position: number) => {
    const value = renderValue?.(position);
    const names = namesByPosition.get(position) ?? [];

    return (
      <View style={styles.readout}>
        <View style={styles.readoutHead}>
          <Text style={styles.readoutTitle}>{getPositionTitle(position)}</Text>
          <CountryFlag country={countryOf(position)} size={16} showName />
        </View>
        {value ? <Text style={styles.readoutValue}>{value}</Text> : null}
        <Text style={styles.readoutNames} numberOfLines={2}>
          {names.length > 0 ? names.join(", ") : "No storms recorded"}
        </Text>
      </View>
    );
  };

  return (
    <PositionGrid
      renderCell={renderCell}
      renderReadout={renderReadout}
      onPositionPress={onPositionPress}
    />
  );
};

const styles = StyleSheet.create({
  readout: {
    gap: 3,
  },
  readoutHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  readoutTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 15,
    color: "#0f172a",
  },
  readoutValue: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: "#0369a1",
  },
  readoutNames: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: "#64748b",
  },
});

export default PositionCellGrid;
