import type { Storm } from "@/lib/types";
import { getDistanceColor } from "@/lib/utils/colors";
import { calculateDistances } from "@/lib/utils/storms";
import { useMemo } from "react";
import NamesGrid from "../_grids/NamesGrid";
import SpecialNamesListDiv from "../_widgets/SpecialNamesListDiv";

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
    <div className="flex flex-col gap-6">
      <NamesGrid stormsData={stormsData} onCellClick={onCellClick} nameColors={nameColors} />
      <SpecialNamesListDiv
        stormsData={stormsData}
        nameColors={nameColors}
        onNameClick={(name) => onCellClick(name, "name")}
      />
    </div>
  );
};

export default DistanceNameGrid;
