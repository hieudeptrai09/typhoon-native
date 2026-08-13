import NamesGrid from "@/lib/components/dashboard/grids/NamesGrid";
import SpecialNamesList from "@/lib/components/dashboard/widgets/SpecialNamesList";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import {
  calculateAverage,
  getGroupedStorms,
  getIntensityFromNumber,
} from "@/lib/utils/storm/aggregate";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface AverageNameGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

const AverageNameGrid = ({ stormsData, onCellClick }: AverageNameGridProps) => {
  const nameColors = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    Object.entries(getGroupedStorms(stormsData, "name")).forEach(([name, storms]) => {
      result[name] = TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))];
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

export default AverageNameGrid;
