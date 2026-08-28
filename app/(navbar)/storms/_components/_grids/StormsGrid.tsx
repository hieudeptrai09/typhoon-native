import type { Storm } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import PositionCellGrid from "./PositionCellGrid";

interface StormsGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
  isClickable?: boolean;
}

const StormsGrid = ({ stormsData, onCellClick, isClickable = true }: StormsGridProps) => (
  <PositionCellGrid
    stormsData={stormsData}
    gridCellViewType="storms"
    onPositionClick={(position) => onCellClick(position, "position")}
    renderCell={(position) => ({
      content: (
        <div className="text-center text-base font-semibold text-foreground">
          {getPositionTitle(position)}
        </div>
      ),
      className: "",
      clickable: isClickable,
    })}
  />
);

export default StormsGrid;
