import type { Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { useMemo, type ReactNode } from "react";
import NamesGrid from "../_grids/NamesGrid";
import SpecialNamesListDiv from "../_widgets/SpecialNamesListDiv";
import { calculateAvgDatesByGroup, formatDayOfYear, getDoyMonth } from "@/lib/utils/stormDates";

interface AvgDateNameGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

const DatePart = ({ doy }: { doy: number }) => (
  <span style={{ color: getAvgDateColor(getDoyMonth(doy)) }}>{formatDayOfYear(doy)}</span>
);

const AvgDateNameGrid = ({ stormsData, onCellClick }: AvgDateNameGridProps) => {
  const nameSubtitles = useMemo<Record<string, ReactNode>>(() => {
    const result: Record<string, ReactNode> = {};
    Object.entries(calculateAvgDatesByGroup(stormsData, "name")).forEach(
      ([name, { startDoy, endDoy }]) => {
        if (startDoy < 0 && endDoy < 0) return;
        result[name] = (
          <>
            <DatePart doy={startDoy} />
            <span className="text-gray-400">–</span>
            <DatePart doy={endDoy} />
          </>
        );
      },
    );
    return result;
  }, [stormsData]);

  return (
    <div className="flex flex-col gap-6">
      <NamesGrid stormsData={stormsData} onCellClick={onCellClick} nameSubtitles={nameSubtitles} />
      <SpecialNamesListDiv
        stormsData={stormsData}
        nameSubtitles={nameSubtitles}
        onNameClick={(name) => onCellClick(name, "name")}
      />
    </div>
  );
};

export default AvgDateNameGrid;
