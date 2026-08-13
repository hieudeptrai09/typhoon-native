import PositionGrid from "@/lib/components/PositionGrid";
import type { Storm } from "@/lib/types";
import { onEnterKeyDown } from "@/lib/utils/a11y";
import type { ReactNode } from "react";

export interface CellRender {
  content: ReactNode;
  className: string;
  clickable: boolean;
}

interface PositionCellGridProps {
  stormsData: Storm[];
  gridCellViewType: "storms" | "average" | "highlights";
  renderCell: (position: number) => CellRender;
  onPositionClick?: (position: number) => void;
}

const getStormNamesForPosition = (stormsData: Storm[], position: number): string[] => {
  if (!stormsData || stormsData.length === 0) return [];
  const storms = stormsData.filter((storm) => storm.position === position);
  return [...new Set(storms.map((storm) => storm.name))];
};

const PositionCellGrid = ({
  stormsData,
  gridCellViewType,
  renderCell,
  onPositionClick,
}: PositionCellGridProps) => (
  <PositionGrid
    showHeader={false}
    renderCell={(position, _row, col) => {
      const { content, className, clickable } = renderCell(position);
      const stormNames = getStormNamesForPosition(stormsData, position);
      const showOverlay = gridCellViewType !== "highlights" && stormNames.length > 0;

      const handleClick = () => {
        if (clickable) onPositionClick?.(position);
      };

      return (
        <td
          key={col}
          className={`group relative border-2 border-stone-200 p-2 ${
            clickable ? "cursor-pointer hover:bg-stone-200" : "cursor-default"
          } ${className}`}
          onClick={handleClick}
          onKeyDown={clickable ? onEnterKeyDown(handleClick) : undefined}
          role={clickable ? "button" : undefined}
          tabIndex={clickable ? 0 : undefined}
          aria-label={stormNames.length > 0 ? `View storms: ${stormNames.join(", ")}` : undefined}
          title={showOverlay ? stormNames.join(", ") : ""}
        >
          {showOverlay && (
            <div
              className="absolute top-0 text-[7px] text-transparent select-none pointer-events-none"
              aria-hidden="true"
            >
              {stormNames.join(", ")}
            </div>
          )}
          <div className="relative z-2 flex min-h-16 w-full items-center justify-center">
            {content}
          </div>
        </td>
      );
    }}
  />
);

export default PositionCellGrid;
