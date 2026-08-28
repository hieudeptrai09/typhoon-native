import type { Storm } from "@/lib/types";
import { EMPTY_POSITION_CELL_CLASS, getHighlightCellClass } from "@/lib/utils/colors";
import PositionCellGrid from "./PositionCellGrid";

interface HighlightsGridProps {
  stormsData: Storm[];
  highlightedStorms: Storm[];
  highlightType: string;
}

const HighlightsGrid = ({ stormsData, highlightedStorms, highlightType }: HighlightsGridProps) => (
  <PositionCellGrid
    stormsData={stormsData}
    gridCellViewType="highlights"
    renderCell={(position) => {
      const positionStorms = highlightedStorms.filter((s) => s.position === position);
      if (positionStorms.length === 0) {
        return {
          content: <span className="text-sm text-gray-300">—</span>,
          className: EMPTY_POSITION_CELL_CLASS,
          clickable: false,
        };
      }
      return {
        content: (
          <div className="flex flex-col items-center gap-1">
            {positionStorms.map((storm, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="text-xs font-bold text-foreground">{storm.name}</div>
                <div className="text-[10px] text-foreground">({storm.year})</div>
              </div>
            ))}
          </div>
        ),
        className: getHighlightCellClass(highlightType),
        clickable: false,
      };
    }}
  />
);

export default HighlightsGrid;
