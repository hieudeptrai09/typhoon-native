import { verbsFor } from "@/lib/components/calendar/dayMarkers";
import ZoomEarthLink from "@/lib/components/common/ZoomEarthLink";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { daysBetween, formatShortDate } from "@/lib/utils/date";
import type { DayEventKind, DayStormEntry } from "@/lib/utils/storm/calendar";
import { Pressable, StyleSheet, Text, View } from "react-native";

const Fact = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.fact}>
    <Text style={styles.factLabel}>{label.toUpperCase()}</Text>
    <Text style={styles.factValue}>{value}</Text>
  </View>
);

const durationOf = (entry: DayStormEntry): string => {
  const days = daysBetween(entry.storm.dateStart, entry.storm.dateEnd);
  if (days === null) return "Still running";
  return days + 1 === 1 ? "1 day" : `${days + 1} days`;
};

const progressOf = (entry: DayStormEntry): string => {
  const { day, total } = entry.progress;
  return total === null ? `Day ${day}` : `Day ${day} of ${total}`;
};

interface DayStormDetailProps {
  entry: DayStormEntry;
  kind: DayEventKind;
  onOpen: () => void;
}

const DayStormDetail = ({ entry, kind, onOpen }: DayStormDetailProps) => {
  const { storm } = entry;
  const verbs = verbsFor(storm.position);

  return (
    <View style={styles.root}>
      <Pressable
        onPress={onOpen}
        hitSlop={6}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        accessibilityRole="link"
        accessibilityLabel={`Open ${storm.name}`}
      >
        <Text
          style={[styles.name, { color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }]}
          numberOfLines={1}
        >
          {storm.name}
          {storm.jtwcDesignation ? <Text style={styles.code}> {storm.jtwcDesignation}</Text> : null}
        </Text>
      </Pressable>

      <View style={styles.facts}>
        <Fact label={verbs.start} value={formatShortDate(storm.dateStart)} />
        <Fact
          label={verbs.end}
          value={storm.dateEnd ? formatShortDate(storm.dateEnd) : "Still out over the basin"}
        />
        <Fact label="Peak" value={INTENSITY_LABEL[storm.intensity]} />
        <Fact
          label={kind === "active" ? "On this date" : "Lasted"}
          value={kind === "active" ? progressOf(entry) : durationOf(entry)}
        />
      </View>

      <ZoomEarthLink storm={storm} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: SPACE.sm,
    paddingTop: SPACE.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.border,
  },
  header: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.6,
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 15,
  },
  code: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  facts: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: SPACE.sm,
  },
  fact: {
    width: "50%",
    gap: 2,
    paddingRight: SPACE.md,
  },
  factLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.6,
    color: COLOR.textFaint,
  },
  factValue: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    lineHeight: 18,
    color: COLOR.text,
  },
});

export default DayStormDetail;
