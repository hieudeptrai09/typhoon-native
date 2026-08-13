import CountryFlag, { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants/position";
import { positionColumnLetter } from "@/lib/utils/position";
import * as Haptics from "expo-haptics";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";

export interface GridCell {
  /** Cell fill — this is what carries the data on a heatmap. */
  color: string;
  clickable: boolean;
  /** Up to ~3 characters drawn inside the cell; omit when the value needs the readout. */
  label?: string;
  labelColor?: string;
}

interface PositionGridProps {
  renderCell: (position: number) => GridCell;
  /** Detail for the cell under the finger, shown in the readout below the grid. */
  renderReadout?: (position: number) => ReactNode;
  onPositionPress?: (position: number) => void;
}

const ROW_LABEL_WIDTH = 18;
const MIN_CELL = 18;
const TAP_SLOP = 8;

const positionAt = (event: GestureResponderEvent, cellSize: number): number | null => {
  if (cellSize <= 0) return null;
  const { locationX, locationY } = event.nativeEvent;
  const col = Math.floor(locationX / cellSize);
  const row = Math.floor(locationY / cellSize);
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
  return row * GRID_COLS + col + 1;
};

/**
 * The 14×10 naming table as a heatmap that fits a phone in one screen: colour
 * carries the value, the axes carry the labels, and dragging a finger across the
 * grid reads out the cell under it. The web build scrolled this table sideways —
 * on a phone that costs the whole point of a 2D layout.
 */
const PositionGrid = ({ renderCell, renderReadout, onPositionPress }: PositionGridProps) => {
  const [plotWidth, setPlotWidth] = useState(0);
  const [peeked, setPeeked] = useState<number | null>(null);
  // Read inside the pan handlers, which are created once and never see fresh state.
  const peekedRef = useRef<number | null>(null);
  const gestureStart = useRef<{ position: number | null; x: number; y: number }>({
    position: null,
    x: 0,
    y: 0,
  });

  const cellSize = plotWidth > 0 ? Math.max(MIN_CELL, plotWidth / GRID_COLS) : 0;

  const cells = useMemo(
    () =>
      Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
        const position = index + 1;
        return { position, ...renderCell(position) };
      }),
    [renderCell],
  );

  // The PanResponder below is built once, so everything its handlers read has to
  // come through a ref — the first render's cellSize is 0 and would swallow every touch.
  const latest = useRef({ cellSize, cells, onPositionPress });
  latest.current = { cellSize, cells, onPositionPress };

  const peek = (position: number | null) => {
    if (position === peekedRef.current) return;
    peekedRef.current = position;
    setPeeked(position);
    if (position !== null) Haptics.selectionAsync();
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const position = positionAt(event, latest.current.cellSize);
        gestureStart.current = {
          position,
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
        };
        peek(position);
      },
      onPanResponderMove: (event) => peek(positionAt(event, latest.current.cellSize)),
      onPanResponderRelease: (event) => {
        const start = gestureStart.current;
        const travelled =
          Math.abs(event.nativeEvent.locationX - start.x) > TAP_SLOP ||
          Math.abs(event.nativeEvent.locationY - start.y) > TAP_SLOP;
        // A scrub leaves the readout on the last cell; only a tap opens the detail.
        if (travelled || start.position === null) return;

        const cell = latest.current.cells[start.position - 1];
        if (cell?.clickable) latest.current.onPositionPress?.(start.position);
      },
    }),
  ).current;

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
          {...pan.panHandlers}
          accessibilityLabel="Typhoon name positions by country"
        >
          {cellSize > 0 &&
            cells.map((cell) => (
              <View
                key={cell.position}
                style={[styles.cellSlot, { width: cellSize, height: cellSize }]}
                accessible
                accessibilityRole={cell.clickable ? "button" : "text"}
                accessibilityLabel={`Position ${Math.floor((cell.position - 1) / GRID_COLS) + 1}${positionColumnLetter(
                  (cell.position - 1) % GRID_COLS,
                )}${cell.label ? `, ${cell.label}` : ""}`}
                onAccessibilityTap={
                  cell.clickable ? () => onPositionPress?.(cell.position) : undefined
                }
              >
                <View
                  style={[
                    styles.cell,
                    { backgroundColor: cell.color },
                    peeked === cell.position && styles.cellPeeked,
                  ]}
                >
                  {cell.label ? (
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[
                        styles.cellLabel,
                        { fontSize: cellSize * 0.38, color: cell.labelColor ?? "#0f172a" },
                      ]}
                    >
                      {cell.label}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
        </View>
      </View>

      {renderReadout ? (
        <View style={styles.readout}>
          {peeked === null ? (
            <Text style={styles.readoutHint}>
              Drag across the grid to read a position, tap to open it.
            </Text>
          ) : (
            renderReadout(peeked)
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
    color: "#94a3b8",
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
    color: "#94a3b8",
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
  cellPeeked: {
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  cellLabel: {
    fontFamily: "OpenSans_600SemiBold",
  },
  readout: {
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  readoutHint: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});

export default PositionGrid;
