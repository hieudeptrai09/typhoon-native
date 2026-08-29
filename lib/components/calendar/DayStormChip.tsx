import { getDayMarker } from "@/lib/components/calendar/dayMarkers";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, RADIUS } from "@/lib/constants/theme";
import type { DayEventKind, DayStormEntry } from "@/lib/utils/storm/calendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text } from "react-native";

// On a storm's first or last day its position in the run is a given, so the length of the run is
// the fact worth carrying; only a mid-life storm needs to say where in it the day fell.
const metaOf = (entry: DayStormEntry, kind: DayEventKind) => {
  const { day, total } = entry.progress;

  if (kind === "active") {
    return {
      text: total === null ? `${day}` : `${day}/${total}`,
      spoken: total === null ? `day ${day}` : `day ${day} of ${total}`,
    };
  }
  if (total === null) return { text: "now", spoken: "still running" };
  return { text: `${total}d`, spoken: total === 1 ? "1 day long" : `${total} days long` };
};

interface DayStormChipProps {
  entry: DayStormEntry;
  kind: DayEventKind;
  onPress: () => void;
}

const DayStormChip = ({ entry, kind, onPress }: DayStormChipProps) => {
  const marker = getDayMarker(entry.reason, entry.storm.position);
  const meta = metaOf(entry, kind);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={`${INTENSITY_LABEL[entry.storm.intensity]} ${entry.storm.name}, ${
        marker.label
      }, ${meta.spoken}. Opens the storm.`}
    >
      <Ionicons name={marker.icon} size={10} color={marker.color} />
      <Text style={[styles.name, { color: TEXT_COLOR_WHITE_BACKGROUND[entry.storm.intensity] }]}>
        {entry.storm.name}
      </Text>
      <Text style={styles.meta}>{meta.text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLOR.surfaceSubtle,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  pressed: {
    opacity: 0.6,
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 13,
  },
  meta: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    color: COLOR.textFaint,
    fontVariant: ["tabular-nums"],
  },
});

export default DayStormChip;
