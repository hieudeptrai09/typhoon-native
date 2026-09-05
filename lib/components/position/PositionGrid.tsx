import CountryFlag, { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants/position";
import { COLOR } from "@/lib/constants/theme";
import { getPositionTitle, positionColumnLetter } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

export interface GridCell {
  color: string;
  clickable: boolean;
  // Up to ~3 characters: the cell is too small for more.
  label?: string;
  labelColor?: string;
}

interface PositionGridProps {
  renderCell: (position: number) => GridCell;
  renderReadout?: (position: number) => ReactNode;
  onPositionPress?: (position: number) => void;
}

const ROW_LABEL_WIDTH = 18;
const MIN_CELL = 18;

interface CellButtonProps {
  position: number;
  cell: GridCell;
  size: number;
  isSelected: boolean;
  onSelect: (position: number) => void;
}

// Split out and memoised: 140 of these re-render on every selection change otherwise.
const CellButton = memo(({ position, cell, size, isSelected, onSelect }: CellButtonProps) => (
  <Pressable
    onPress={() => onSelect(position)}
    style={[styles.cellSlot, { width: size, height: size }]}
    accessibilityRole={cell.clickable ? "button" : "text"}
    accessibilityState={{ selected: isSelected }}
    accessibilityLabel={`Position ${Math.floor((position - 1) / GRID_COLS) + 1}${positionColumnLetter(
      (position - 1) % GRID_COLS,
    )}${cell.label ? `, ${cell.label}` : ""}`}
  >
    <View style={[styles.cell, { backgroundColor: cell.color }, isSelected && styles.cellSelected]}>
      {cell.label ? (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.cellLabel,
            { fontSize: size * 0.38, color: cell.labelColor ?? COLOR.text },
          ]}
        >
          {cell.label}
        </Text>
      ) : null}
    </View>
  </Pressable>
));
CellButton.displayName = "CellButton";

// A cell is ~22dp wide, well under a comfortable tap target, so a single tap only selects.
// Opening is the full-width button in the readout, or a second tap on the selected cell.
const PositionGrid = ({ renderCell, renderReadout, onPositionPress }: PositionGridProps) => {
  const [plotWidth, setPlotWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  // Read by the tap handler, which is kept stable so the 140 memoised cells survive a selection.
  const selectedRef = useRef<number | null>(null);
  const latest = useRef({ onPositionPress, hasReadout: renderReadout !== undefined });
  useEffect(() => {
    latest.current = { onPositionPress, hasReadout: renderReadout !== undefined };
  }, [onPositionPress, renderReadout]);

  const cellSize = plotWidth > 0 ? Math.max(MIN_CELL, plotWidth / GRID_COLS) : 0;

  const cells = useMemo(
    () =>
      Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
        const position = index + 1;
        return { position, ...renderCell(position) };
      }),
    [renderCell],
  );
  const cellsRef = useRef(cells);
  useEffect(() => {
    cellsRef.current = cells;
  }, [cells]);

  const handleSelect = useCallback((position: number) => {
    Haptics.selectionAsync();

    const cell = cellsRef.current[position - 1];
    // Without a readout there is nowhere for a selection to show, so the tap has to open outright.
    const confirming = selectedRef.current === position || !latest.current.hasReadout;
    if (confirming && cell?.clickable) {
      latest.current.onPositionPress?.(position);
      return;
    }

    selectedRef.current = position;
    setSelected(position);
  }, []);

  const handleLayout = (event: LayoutChangeEvent) => setPlotWidth(event.nativeEvent.layout.width);

  return (
    <View style={styles.root}>
      <View style={styles.columnAxis}>
        <View style={{ width: ROW_LABEL_WIDTH }} />
        {COUNTRY_NAMES.map((country, col) => (
          <View key={country} style={styles.columnHead}>
            <CountryFlag country={country} size={cellSize > 0 ? cellSize * 0.62 : 14} />
            <Text style={styles.columnLetter}>{positionColumnLetter(col)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.body}>
        <View style={styles.rowAxis}>
          {Array.from({ length: GRID_ROWS }, (_, row) => (
            <View key={row} style={[styles.rowHead, { height: cellSize }]}>
              <Text style={styles.rowLabel}>{row + 1}</Text>
            </View>
          ))}
        </View>

        <View
          style={styles.plot}
          onLayout={handleLayout}
          accessibilityLabel="Typhoon name positions by country"
        >
          {cellSize > 0 &&
            cells.map((cell) => (
              <CellButton
                key={cell.position}
                position={cell.position}
                cell={cell}
                size={cellSize}
                isSelected={selected === cell.position}
                onSelect={handleSelect}
              />
            ))}
        </View>
      </View>

      {renderReadout ? (
        <View style={styles.readout}>
          {selected === null ? (
            <Text style={styles.readoutHint}>Tap a cell to read it, then open it.</Text>
          ) : (
            <>
              {renderReadout(selected)}
              {cells[selected - 1]?.clickable && (
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    onPositionPress?.(selected);
                  }}
                  style={({ pressed }) => [styles.open, pressed && styles.openPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${getPositionTitle(selected)}`}
                >
                  <Text style={styles.openLabel}>Open {getPositionTitle(selected)}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLOR.textInverse} />
                </Pressable>
              )}
            </>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  columnAxis: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  columnHead: {
    flex: 1,
    alignItems: "center",
    gap: 1,
  },
  columnLetter: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 9,
    color: COLOR.textFaint,
  },
  body: {
    flexDirection: "row",
  },
  rowAxis: {
    width: ROW_LABEL_WIDTH,
  },
  rowHead: {
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 10,
    color: COLOR.textFaint,
  },
  plot: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cellSlot: {
    padding: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: COLOR.text,
  },
  cellLabel: {
    fontFamily: "OpenSans_600SemiBold",
  },
  readout: {
    minHeight: 54,
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLOR.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  open: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLOR.accent,
  },
  openPressed: {
    opacity: 0.7,
  },
  openLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textInverse,
  },
  readoutHint: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textFaint,
    textAlign: "center",
  },
});

export default PositionGrid;
