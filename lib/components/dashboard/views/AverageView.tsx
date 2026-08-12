import AverageListTable from "@/lib/components/dashboard/views/AverageListTable";
import AverageNameGrid from "@/lib/components/dashboard/views/AverageNameGrid";
import AveragePositionGrid from "@/lib/components/dashboard/views/AveragePositionGrid";
import type { DashboardParams, Storm } from "@/lib/types";

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
