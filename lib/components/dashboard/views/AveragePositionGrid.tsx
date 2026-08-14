import ScreenScroll from "@/lib/components/common/ScreenScroll";
import AverageGrid from "@/lib/components/dashboard/grids/AverageGrid";
import SpecialButtons from "@/lib/components/dashboard/widgets/SpecialButtons";
import type { Storm } from "@/lib/types";

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
  <ScreenScroll>
    <AverageGrid
      onCellClick={onCellClick}
      stormsData={stormsData}
      averageValues={averageValues}
      isClickable
    />
    <SpecialButtons onCellClick={onCellClick} isAverageView averageValues={averageValues} />
  </ScreenScroll>
);

export default AveragePositionGrid;
