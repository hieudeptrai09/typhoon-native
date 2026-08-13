import StatTile from "@/lib/components/common/StatTile";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getAvgDateColor, getDistanceColor } from "@/lib/utils/colors";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getIntensityFromNumber,
} from "@/lib/utils/storm/aggregate";
import {
  calculateAvgDates,
  calculateAvgDuration,
  formatDayOfYear,
  formatDuration,
  getDoyMonth,
} from "@/lib/utils/storm/dates";
import { StyleSheet, Text, View } from "react-native";

const DatePart = ({ doy }: { doy: number }) => (
  <Text style={{ color: getAvgDateColor(getDoyMonth(doy)) }}>{formatDayOfYear(doy)}</Text>
);

const StormStats = ({ storms }: { storms: Storm[] }) => {
  if (storms.length === 0) return null;

  const average = calculateAverage(storms);
  const intensity = getIntensityFromNumber(average);
  const recurrence = calculateGapAverage(storms);
  const { startDoy, endDoy } = calculateAvgDates(storms);
  const duration = calculateAvgDuration(storms);

  return (
    // Two columns: four tiles across is unreadable at phone widths, and these values are short.
    <View style={styles.grid}>
      <View style={styles.cell}>
        <StatTile label="Avg. intensity" hint={`${INTENSITY_LABEL[intensity]} on a −2 to 5 scale`}>
          <Text style={{ color: TEXT_COLOR_WHITE_BACKGROUND[intensity] }}>
            {average.toFixed(2)}
          </Text>
        </StatTile>
      </View>

      <View style={styles.cell}>
        <StatTile
          label="Recurrence"
          hint={
            recurrence < 0
              ? "Only one storm, so no recurrence can be measured"
              : "Average years between appearances"
          }
        >
          <Text style={{ color: getDistanceColor(recurrence) }}>{formatDistance(recurrence)}</Text>
          {recurrence >= 0 && <Text style={styles.unit}> yrs</Text>}
        </StatTile>
      </View>

      <View style={styles.cell}>
        <StatTile label="Avg. date" hint="Average start and end date">
          <DatePart doy={startDoy} />
          <Text style={styles.separator}> – </Text>
          <DatePart doy={endDoy} />
        </StatTile>
      </View>

      <View style={styles.cell}>
        <StatTile label="Avg. duration" hint="Average days from start to end">
          <Text style={styles.plain}>{formatDuration(duration)}</Text>
        </StatTile>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cell: {
    // Half the row minus the gap, so two tiles sit side by side and the rest wrap under them.
    flexBasis: "48%",
    flexGrow: 1,
  },
  unit: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  separator: {
    color: "#9ca3af",
  },
  plain: {
    color: "#334155",
  },
});

export default StormStats;
