import type { Storm } from "@/lib/types";
import AverageGrid from "../_grids/AverageGrid";
import SpecialButtons from "../_widgets/SpecialButtons";

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
  <div className="flex flex-col gap-6">
    <AverageGrid
      onCellClick={onCellClick}
      stormsData={stormsData}
      averageValues={averageValues}
      isClickable
    />
    <SpecialButtons onCellClick={onCellClick} isAverageView averageValues={averageValues} />
  </div>
);

export default AveragePositionGrid;
