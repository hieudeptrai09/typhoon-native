import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { BACKGROUND_BADGE, HIGHLIGHT_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { IntensityType, Storm } from "@/lib/types";
import { useCallback, useMemo } from "react";

interface IntensityGridProps {
  stormsData: Storm[];
  intensityStorms: Storm[];
  intensity: IntensityType;
}

// A name reused across seasons gets one line with its years listed, rather than one line each.
const summarise = (storms: Storm[]): string[] => {
  const years = new Map<string, number[]>();
  storms.forEach((storm) => {
    const seen = years.get(storm.name) ?? [];
    if (!seen.includes(storm.year)) seen.push(storm.year);
    years.set(storm.name, seen);
  });
  return [...years].map(
    ([name, seen]) => `${name} (${[...seen].sort((a, b) => a - b).join(", ")})`,
  );
};

// Cells borrow the badge palette so a filled position reads as the same colour as its IntensityBadge.
const IntensityGrid = ({ stormsData, intensityStorms, intensity }: IntensityGridProps) => {
  const byPosition = useMemo(() => {
    const map = new Map<number, Storm[]>();
    intensityStorms.forEach((storm) => {
      map.set(storm.position, [...(map.get(storm.position) ?? []), storm]);
    });
    return map;
  }, [intensityStorms]);

  const renderValue = useCallback(
    (position: number) => {
      const storms = byPosition.get(position);
      return storms && storms.length > 0 ? summarise(storms) : undefined;
    },
    [byPosition],
  );

  const renderCell = useCallback(
    (position: number) => ({
      color: byPosition.has(position) ? BACKGROUND_BADGE[intensity] : HIGHLIGHT_EMPTY_CELL_COLOR,
      clickable: false,
    }),
    [byPosition, intensity],
  );

  return (
    <PositionCellGrid stormsData={stormsData} renderValue={renderValue} renderCell={renderCell} />
  );
};

export default IntensityGrid;
