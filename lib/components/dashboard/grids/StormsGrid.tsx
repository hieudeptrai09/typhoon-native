import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { getStormCountColor } from "@/lib/utils/colors";
import { isExternalPosition } from "@/lib/utils/position";
import { useCallback, useMemo } from "react";

interface StormsGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
  isClickable?: boolean;
}

const StormsGrid = ({ stormsData, onCellClick, isClickable = true }: StormsGridProps) => {
  const countByPosition = useMemo(() => {
    const counts = new Map<number, number>();
    stormsData.forEach((storm) =>
      counts.set(storm.position, (counts.get(storm.position) ?? 0) + 1),
    );
    return counts;
  }, [stormsData]);

  // Only the naming table is drawn here. CPHC, NHC and IMD sit outside it with far more storms
  // apiece, and letting them set the maximum would flatten all 140 cells onto one shade.
  const maxCount = useMemo(
    () =>
      Math.max(
        0,
        ...[...countByPosition.entries()]
          .filter(([position]) => !isExternalPosition(position))
          .map(([, count]) => count),
      ),
    [countByPosition],
  );

  // PositionCellGrid memoises 140 cells against these, so an inline arrow would rebuild all of
  // them on every render of this component.
  const renderValue = useCallback(
    (position: number) => {
      const count = countByPosition.get(position) ?? 0;
      return [`${count} storm${count === 1 ? "" : "s"}`];
    },
    [countByPosition],
  );

  const renderCell = useCallback(
    (position: number) => {
      const count = countByPosition.get(position) ?? 0;
      return {
        color: getStormCountColor(count, maxCount),
        label: count > 0 ? String(count) : undefined,
        // Both stops are deep blue, so a filled cell always needs its number knocked out.
        labelColor: COLOR.textInverse,
        clickable: isClickable,
      };
    },
    [countByPosition, maxCount, isClickable],
  );

  const handlePress = useCallback(
    (position: number) => onCellClick(position, "position"),
    [onCellClick],
  );

  return (
    <PositionCellGrid
      stormsData={stormsData}
      onPositionPress={handlePress}
      renderValue={renderValue}
      renderCell={renderCell}
    />
  );
};

export default StormsGrid;
