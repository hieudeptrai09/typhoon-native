import type { IntensityType, Storm } from "@/lib/types";
import { BACKGROUND_BADGE, EMPTY_POSITION_CELL_CLASS, TEXT_COLOR_BADGE } from "@/lib/utils/colors";
import PositionCellGrid from "./PositionCellGrid";

interface IntensityGridProps {
  stormsData: Storm[];
  intensityStorms: Storm[];
  intensity: IntensityType;
}

// A name reused across seasons gets one entry with its years listed, so the cell stays readable.
const groupYearsByName = (storms: Storm[]): { name: string; years: number[] }[] => {
  const years = new Map<string, Set<number>>();
  for (const storm of storms) {
    const seen = years.get(storm.name) ?? new Set<number>();
    seen.add(storm.year);
    years.set(storm.name, seen);
  }
  return [...years].map(([name, seen]) => ({ name, years: [...seen].sort((a, b) => a - b) }));
};

// Cells borrow the badge palette so a filled position reads as the same colour as its IntensityBadge.
const IntensityGrid = ({ stormsData, intensityStorms, intensity }: IntensityGridProps) => (
  <PositionCellGrid
    stormsData={stormsData}
    gridCellViewType="intensity"
    renderCell={(position) => {
      const positionStorms = intensityStorms.filter((s) => s.position === position);
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
            {groupYearsByName(positionStorms).map(({ name, years }) => (
              <div key={name} className="flex flex-col items-center">
                <div className="text-xs font-bold text-center">{name}</div>
                <div className="text-[11px] text-center">({years.join(", ")})</div>
              </div>
            ))}
          </div>
        ),
        className: "",
        clickable: false,
        style: {
          backgroundColor: BACKGROUND_BADGE[intensity],
          color: TEXT_COLOR_BADGE[intensity],
        },
      };
    }}
  />
);

export default IntensityGrid;
