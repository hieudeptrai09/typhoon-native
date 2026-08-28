import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { HIGHLIGHT_EMPTY_CELL_COLOR } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { useCallback, useMemo } from "react";

interface SubsetGridProps {
  stormsData: Storm[];
  /** The storms the current record slice picked out; every other position stays empty. */
  storms: Storm[];
  color: string;
  /** True where one position can hold several of the picked storms, e.g. a whole category. */
  mergeYears?: boolean;
}

// A name reused across seasons gets one line with its years listed, rather than one line each.
const mergedNames = (storms: Storm[]): string[] => {
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

const SubsetGrid = ({ stormsData, storms, color, mergeYears = false }: SubsetGridProps) => {
  const byPosition = useMemo(() => {
    const map = new Map<number, Storm[]>();
    storms.forEach((storm) => {
      map.set(storm.position, [...(map.get(storm.position) ?? []), storm]);
    });
    return map;
  }, [storms]);

  const renderValue = useCallback(
    (position: number) => {
      const group = byPosition.get(position);
      if (!group || group.length === 0) return undefined;
      return mergeYears ? mergedNames(group) : group.map((s) => `${s.name} (${s.year})`);
    },
    [byPosition, mergeYears],
  );

  const renderCell = useCallback(
    (position: number) => ({
      color: byPosition.has(position) ? color : HIGHLIGHT_EMPTY_CELL_COLOR,
      clickable: false,
    }),
    [byPosition, color],
  );

  return (
    <PositionCellGrid stormsData={stormsData} renderValue={renderValue} renderCell={renderCell} />
  );
};

export default SubsetGrid;
