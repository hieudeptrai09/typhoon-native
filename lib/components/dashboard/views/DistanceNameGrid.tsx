import NamesGrid from "@/lib/components/dashboard/grids/NamesGrid";
import SpecialNamesList from "@/lib/components/dashboard/widgets/SpecialNamesList";
import type { Storm } from "@/lib/types";
import { getDistanceColor } from "@/lib/utils/colors";
import { calculateDistances } from "@/lib/utils/storm/aggregate";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface DistanceNameGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

const DistanceNameGrid = ({ stormsData, onCellClick }: DistanceNameGridProps) => {
  const nameColors = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    Object.entries(calculateDistances(stormsData, "name")).forEach(([name, dist]) => {
      result[name] = getDistanceColor(dist);
    });
    return result;
  }, [stormsData]);

  return (
    <View style={styles.root}>
      <NamesGrid stormsData={stormsData} onCellClick={onCellClick} nameColors={nameColors} />
      <SpecialNamesList
        stormsData={stormsData}
        nameColors={nameColors}
        onNameClick={(name) => onCellClick(name, "name")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 16,
  },
});

export default DistanceNameGrid;
