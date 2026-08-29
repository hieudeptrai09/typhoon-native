import MonthAxis from "@/lib/components/common/MonthAxis";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { dayIndexOf, DAYS_OF_YEAR, MONTH_START_INDEX, monthDayAt } from "@/lib/utils/date";
import * as Haptics from "expo-haptics";
import { useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import Svg, { Circle, Line, Path } from "react-native-svg";

const DAY_COUNT = DAYS_OF_YEAR.length;
const CHART_HEIGHT = 190;
// Room for the y labels, which sit outside the plot so the year still spans the full width.
const GUTTER = 28;
const TICK_COUNT = 3;
// A drag across the whole year crosses 366 days; a tick on every one of them is a buzz, not
// feedback.
const HAPTIC_INTERVAL_MS = 55;

// Counts are drawn raw rather than smoothed: a y axis that reads in storms has to be countable
// against the shape it labels.
const ridgePath = (density: number[], width: number, max: number): string => {
  const slot = width / DAY_COUNT;
  const y = (value: number) => CHART_HEIGHT - (value / max) * CHART_HEIGHT;

  let path = `M 0 ${CHART_HEIGHT}`;
  density.forEach((value, index) => {
    const top = y(value).toFixed(2);
    path += ` L ${(index * slot).toFixed(2)} ${top} L ${((index + 1) * slot).toFixed(2)} ${top}`;
  });
  return `${path} L ${width.toFixed(2)} ${CHART_HEIGHT} Z`;
};

const monthTicksPath = (width: number): string => {
  const slot = width / DAY_COUNT;
  return MONTH_START_INDEX.slice(1)
    .map((start) => `M ${(start * slot).toFixed(2)} 0 V ${CHART_HEIGHT}`)
    .join(" ");
};

interface DayYearChartProps {
  density: number[];
  inspected: string;
  pageDay: string;
  today: string;
  onInspect: (monthDay: string) => void;
}

const DayYearChart = ({ density, inspected, pageDay, today, onInspect }: DayYearChartProps) => {
  const [width, setWidth] = useState(0);
  const plotWidth = Math.max(0, width - GUTTER);

  const plotValue = useSharedValue(0);
  const lastIndex = useSharedValue(-1);
  const lastHaptic = useRef(0);

  const peak = useMemo(() => Math.max(...density, 1), [density]);
  // Round the axis up to a whole number of steps, so every label is an integer.
  const step = Math.max(1, Math.ceil(peak / TICK_COUNT));
  const axisMax = step * TICK_COUNT;
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, index) => index * step);

  const path = useMemo(
    () => (plotWidth > 0 ? ridgePath(density, plotWidth, axisMax) : ""),
    [density, plotWidth, axisMax],
  );
  const months = useMemo(() => (plotWidth > 0 ? monthTicksPath(plotWidth) : ""), [plotWidth]);

  const pickDay = (index: number) => {
    const now = Date.now();
    if (now - lastHaptic.current > HAPTIC_INTERVAL_MS) {
      lastHaptic.current = now;
      Haptics.selectionAsync();
    }
    onInspect(monthDayAt(index));
  };

  const scrub = useMemo(
    () => {
      const indexAt = (x: number) => {
        "worklet";
        return Math.min(DAY_COUNT - 1, Math.max(0, Math.floor((x / plotValue.value) * DAY_COUNT)));
      };

      const tap = Gesture.Tap().onEnd((event) => {
        if (plotValue.value <= 0) return;
        lastIndex.value = indexAt(event.x);
        runOnJS(pickDay)(lastIndex.value);
      });

      // Only a sideways drag scrubs, so a vertical one still scrolls the sheet it sits in.
      const pan = Gesture.Pan()
        .activeOffsetX([-6, 6])
        .failOffsetY([-14, 14])
        .onBegin(() => {
          lastIndex.value = -1;
        })
        .onUpdate((event) => {
          if (plotValue.value <= 0) return;
          const index = indexAt(event.x);
          if (index === lastIndex.value) return;
          lastIndex.value = index;
          runOnJS(pickDay)(index);
        });

      return Gesture.Race(pan, tap);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onInspect],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth(next);
    plotValue.value = Math.max(0, next - GUTTER);
  };

  const slot = plotWidth / DAY_COUNT;
  const xOf = (monthDay: string) => (dayIndexOf(monthDay) + 0.5) * slot;
  const yOf = (value: number) => CHART_HEIGHT - (value / axisMax) * CHART_HEIGHT;

  const inspectedX = xOf(inspected);

  return (
    <View onLayout={onLayout}>
      <View style={styles.plot}>
        {ticks.map((tick) => (
          <Text key={tick} style={[styles.tickLabel, { top: yOf(tick) - 7 }]}>
            {tick}
          </Text>
        ))}

        {plotWidth > 0 && (
          <GestureDetector gesture={scrub}>
            <View
              style={styles.canvas}
              accessibilityRole="adjustable"
              accessibilityLabel={`Day of year. ${inspected}`}
              accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
              onAccessibilityAction={({ nativeEvent }) =>
                onInspect(
                  monthDayAt(
                    dayIndexOf(inspected) + (nativeEvent.actionName === "increment" ? 1 : -1),
                  ),
                )
              }
            >
              <Svg width={plotWidth} height={CHART_HEIGHT}>
                {ticks.map((tick) => (
                  <Line
                    key={tick}
                    x1={0}
                    y1={yOf(tick)}
                    x2={plotWidth}
                    y2={yOf(tick)}
                    stroke={COLOR.border}
                    strokeWidth={1}
                  />
                ))}
                <Path d={months} stroke={COLOR.surfaceMuted} strokeWidth={1} fill="none" />
                <Path
                  d={path}
                  fill={COLOR.accentSoft}
                  stroke={COLOR.accentBorder}
                  strokeWidth={1}
                />

                {today !== inspected && (
                  <Line
                    x1={xOf(today)}
                    y1={0}
                    x2={xOf(today)}
                    y2={CHART_HEIGHT}
                    stroke={COLOR.textFaint}
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                )}
                {/* Where the calendar underneath still stands, once the drag has moved away. */}
                {pageDay !== inspected && (
                  <Line
                    x1={xOf(pageDay)}
                    y1={0}
                    x2={xOf(pageDay)}
                    y2={CHART_HEIGHT}
                    stroke={COLOR.accentBorder}
                    strokeWidth={2}
                  />
                )}

                <Line
                  x1={inspectedX}
                  y1={0}
                  x2={inspectedX}
                  y2={CHART_HEIGHT}
                  stroke={COLOR.accent}
                  strokeWidth={2}
                />
                <Circle cx={inspectedX} cy={5} r={5} fill={COLOR.accent} />
              </Svg>
            </View>
          </GestureDetector>
        )}
      </View>

      <View style={styles.axis}>
        <MonthAxis width={plotWidth} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  plot: {
    height: CHART_HEIGHT,
  },
  canvas: {
    position: "absolute",
    left: GUTTER,
  },
  tickLabel: {
    position: "absolute",
    left: 0,
    width: GUTTER - 6,
    textAlign: "right",
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 10,
    color: COLOR.textFaint,
    fontVariant: ["tabular-nums"],
  },
  axis: {
    marginLeft: GUTTER,
    marginTop: SPACE.xs,
  },
});

export default DayYearChart;
