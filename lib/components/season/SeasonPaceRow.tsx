import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import { getSeasonPaceColor } from "@/lib/utils/colors";
import { formatPaceDelta } from "@/lib/utils/format";
import type { SeasonToDateRow } from "@/lib/utils/storm/calendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

export interface PaceRow extends SeasonToDateRow {
  delta: number; // storms ahead of (or behind) the average season by this date
  share: number | null; // null while the season is still running, with no final total to divide by
}

interface SeasonPaceRowProps {
  row: PaceRow;
  average: number;
  scaleMax: number;
}

const SeasonPaceRow = ({ row, average, scaleMax }: SeasonPaceRowProps) => {
  const paceColor = getSeasonPaceColor(row.delta);
  const share = (value: number): `${number}%` => `${scaleMax > 0 ? (value / scaleMax) * 100 : 0}%`;

  return (
    <View style={styles.root}>
      <Text style={styles.year}>{row.year}</Text>

      <View style={styles.track}>
        {/* The rest of the season, so the solid part reads as the share already run. */}
        <View style={[styles.rest, { width: share(row.total), borderColor: paceColor }]} />
        <View style={[styles.filled, { width: share(row.toDate), backgroundColor: paceColor }]} />
        <View style={[styles.tick, { left: share(average) }]} />
      </View>

      <Text style={styles.toDate}>{row.toDate}</Text>
      <Text style={[styles.delta, { color: paceColor }]}>{formatPaceDelta(row.delta)}</Text>
      <Ionicons name="chevron-forward" size={14} color={COLOR.textFaint} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
  },
  year: {
    width: 36,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  track: {
    flex: 1,
    height: 12,
    justifyContent: "center",
  },
  rest: {
    position: "absolute",
    height: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    opacity: 0.35,
  },
  filled: {
    position: "absolute",
    height: 12,
    borderRadius: RADIUS.pill,
  },
  // Every row shares one average, so the ticks stack into a single line down the list.
  tick: {
    position: "absolute",
    top: -3,
    width: 2,
    height: 18,
    borderRadius: 1,
    backgroundColor: COLOR.textSecondary,
  },
  toDate: {
    width: 24,
    textAlign: "right",
    fontFamily: "OpenSans_700Bold",
    fontSize: 13,
    color: COLOR.text,
    fontVariant: ["tabular-nums"],
  },
  delta: {
    width: 38,
    textAlign: "right",
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
});

export default SeasonPaceRow;
