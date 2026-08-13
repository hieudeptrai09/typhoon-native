import { SPECIAL_POSITIONS, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { getAvgDateColor, getDistanceColor } from "@/lib/utils/colors";
import { getIntensityFromNumber } from "@/lib/utils/storm/aggregate";
import { formatDayOfYear, getDoyMonth, type AvgDates } from "@/lib/utils/storm/dates";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SpecialButtonsProps {
  onCellClick: (data: number, key: string) => void;
  isAverageView?: boolean;
  averageValues?: Record<number, number> | null;
  distanceValues?: Record<number, number> | null;
  avgDateValues?: Record<number, AvgDates> | null;
}

const SpecialButtons = ({
  onCellClick,
  isAverageView = false,
  averageValues = null,
  distanceValues = null,
  avgDateValues = null,
}: SpecialButtonsProps) => {
  const getButtonContent = (buttonId: number): { color: string; suffix: string } => {
    if (avgDateValues && avgDateValues[buttonId] !== undefined) {
      const { startDoy, endDoy } = avgDateValues[buttonId];
      return {
        color: getAvgDateColor(getDoyMonth(startDoy)),
        suffix:
          startDoy < 0 && endDoy < 0
            ? ""
            : `${formatDayOfYear(startDoy)}–${formatDayOfYear(endDoy)}`,
      };
    }
    if (distanceValues && distanceValues[buttonId] !== undefined) {
      const dist = distanceValues[buttonId];
      return {
        color: getDistanceColor(dist),
        suffix: dist < 0 ? "" : `${dist.toFixed(2)}y`,
      };
    }
    if (isAverageView && averageValues && averageValues[buttonId]) {
      return {
        color: TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(averageValues[buttonId])],
        suffix: "",
      };
    }
    return { color: "#374151", suffix: "" };
  };

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Other Regions</Text>
      <View style={styles.row}>
        {SPECIAL_POSITIONS.map((button) => {
          const { color, suffix } = getButtonContent(button.id);

          return (
            <Pressable
              key={button.id}
              onPress={() => {
                Haptics.selectionAsync();
                onCellClick(button.id, "position");
              }}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`View storms from ${button.label} region`}
            >
              <Text style={[styles.label, { color }]}>{button.label}</Text>
              {/* The suffix is the cell value the grid would have shown, so it stays subordinate */}
              {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  heading: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#64748b",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 92,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 14,
  },
  suffix: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 11,
    color: "#64748b",
    fontVariant: ["tabular-nums"],
  },
});

export default SpecialButtons;
