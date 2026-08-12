import type { DashboardParams, Storm } from "@/lib/types";
import AverageListTable from "./AverageListTable";
import AverageNameGrid from "./AverageNameGrid";
import AveragePositionGrid from "./AveragePositionGrid";

interface AverageViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  averageValues: Record<number, number> | null;
  onCellClick: (data: number | string, key: string) => void;
}

const AverageView = ({ params, stormsData, averageValues, onCellClick }: AverageViewProps) => {
  const { filter, mode } = params;

  if (mode === "table") {
    if (filter === "name") {
      return <AverageNameGrid stormsData={stormsData} onCellClick={onCellClick} />;
    }
    return (
      <AveragePositionGrid
        stormsData={stormsData}
        averageValues={averageValues}
        onCellClick={onCellClick}
      />
    );
  }

  return <AverageListTable filter={filter} stormsData={stormsData} onCellClick={onCellClick} />;
};

export default AverageView;
