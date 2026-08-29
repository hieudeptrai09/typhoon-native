import DayStormChip from "@/lib/components/calendar/DayStormChip";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { DayEventKind, SpineYearRow as Row } from "@/lib/utils/storm/calendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SpineYearRowProps {
  row: Row;
  kind: DayEventKind;
  onOpen: () => void;
  onOpenStorm: (name: string) => void;
}

const SpineYearRow = ({ row, kind, onOpen, onOpenStorm }: SpineYearRowProps) => (
  <Pressable
    onPress={() => {
      Haptics.selectionAsync();
      onOpen();
    }}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    accessibilityRole="button"
    accessibilityLabel={`${row.year}, ${row.entries.length} storm${
      row.entries.length === 1 ? "" : "s"
    }. Opens the details.`}
  >
    <Text style={styles.year}>{row.year}</Text>

    <View style={styles.chips}>
      {row.entries.map((entry) => (
        <DayStormChip
          key={entry.key}
          entry={entry}
          kind={kind}
          onPress={() => onOpenStorm(entry.storm.name)}
        />
      ))}
    </View>

    <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} style={styles.chevron} />
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.sm,
    backgroundColor: COLOR.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.md,
  },
  pressed: {
    opacity: 0.7,
  },
  year: {
    // Fixed width so the chips line up into a column instead of stepping with the year.
    width: 36,
    paddingTop: 6,
    fontFamily: "OpenSans_700Bold",
    fontSize: 13,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
  chips: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.xs,
  },
  chevron: {
    paddingTop: 7,
  },
});

export default SpineYearRow;
