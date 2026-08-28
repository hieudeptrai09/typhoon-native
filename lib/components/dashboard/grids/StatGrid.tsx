import PositionCellGrid from "@/lib/components/position/PositionCellGrid";
import {
  BACKGROUND_BADGE,
  GRID_EMPTY_CELL_COLOR,
  INTENSITY_LABEL,
  TEXT_COLOR_BADGE,
} from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { getIntensityFromNumber } from "@/lib/utils/storm/aggregate";
import { formatDuration, getDoyMonth } from "@/lib/utils/storm/dates";
import type { StatRow } from "@/lib/utils/storm/stats";
import { useCallback, useMemo } from "react";

interface StatGridProps {
  stormsData: Storm[];
  rows: StatRow[];
  metric: string;
  onCellClick: (data: number | string, key: string) => void;
}

const readoutLines = (row: StatRow, metric: string): string[] => {
  if (metric === "recurrence") {
    return [row.value < 0 ? "Recurrence not measurable" : `Avg recurrence ${row.display} years`];
  }
  if (metric === "dates") {
    return [`Avg season ${row.display}`, `Avg duration ${formatDuration(row.duration ?? -1)}`];
  }
  return [`Avg ${row.display} — ${INTENSITY_LABEL[getIntensityFromNumber(row.value)]}`];
};

/**
 * What the cell says out loud, so the colour never has to be looked up. Two characters at most:
 * the cell is about 24dp wide, and a month abbreviation or a decimal shrinks to unreadable there.
 * Recurrence reads against six years, which is roughly how long the 140-position list takes to
 * come round; the readout under the grid still gives the figure itself.
 */
const cellLabel = (row: StatRow, metric: string): string | undefined => {
  if (metric === "recurrence") {
    if (row.value < 0) return undefined;
    if (row.value < 6) return "<6";
    return row.value === 6 ? "=6" : ">6";
  }
  if (metric === "dates") return row.value < 0 ? undefined : String(getDoyMonth(row.value));
  return getIntensityFromNumber(row.value);
};

/** One grid for all three metrics: only the cell colour and the readout wording differ. */
const StatGrid = ({ stormsData, rows, metric, onCellClick }: StatGridProps) => {
  const byPosition = useMemo(() => {
    const map = new Map<number, StatRow>();
    rows.forEach((row) => map.set(Number(row.key), row));
    return map;
  }, [rows]);

  const renderValue = useCallback(
    (position: number) => {
      const row = byPosition.get(position);
      return row ? readoutLines(row, metric) : undefined;
    },
    [byPosition, metric],
  );

  const renderCell = useCallback(
    (position: number) => {
      const row = byPosition.get(position);
      // A position with no storms has no group to open, so it never offers the readout's button.
      if (!row) return { color: GRID_EMPTY_CELL_COLOR, clickable: false };

      // The intensity metric borrows the badge palette so a cell reads as the same colour as the
      // IntensityBadge beside the same storm elsewhere; the other two are already dark enough to
      // carry white text.
      const intensity = metric === "intensity" ? getIntensityFromNumber(row.value) : null;
      return {
        color: intensity ? BACKGROUND_BADGE[intensity] : row.color,
        label: cellLabel(row, metric),
        labelColor: intensity ? TEXT_COLOR_BADGE[intensity] : COLOR.textInverse,
        clickable: true,
      };
    },
    [byPosition, metric],
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

export default StatGrid;
