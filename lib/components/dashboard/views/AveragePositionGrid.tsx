import AverageGrid from "@/lib/components/dashboard/grids/AverageGrid";
import SpecialButtons from "@/lib/components/dashboard/widgets/SpecialButtons";
import type { Storm } from "@/lib/types";
import { StyleSheet, View } from "react-native";

interface AveragePositionGridProps {
  stormsData: Storm[];
  averageValues: Record<number, number> | null;
  onCellClick: (data: number | string, key: string) => void;
}

const AveragePositionGrid = ({
  stormsData,
  averageValues,
  onCellClick,
}: AveragePositionGridProps) => (
  <View style={styles.root}>
    <AverageGrid
      onCellClick={onCellClick}
      stormsData={stormsData}
      averageValues={averageValues}
      isClickable
    />
    <SpecialButtons onCellClick={onCellClick} isAverageView averageValues={averageValues} />
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
});

export default AveragePositionGrid;
