import type { Storm } from "@/lib/types";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { calculateAverage, getGroupedStorms, getIntensityFromNumber } from "@/lib/utils/storms";
import { useMemo } from "react";
import NamesGrid from "../_grids/NamesGrid";
import SpecialNamesListDiv from "../_widgets/SpecialNamesListDiv";

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

export default AverageNameGrid;
