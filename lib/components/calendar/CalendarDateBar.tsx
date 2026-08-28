import MonthDayPicker from "@/lib/components/calendar/MonthDayPicker";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { formatMonthDay, shiftMonthDay } from "@/lib/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CalendarDateBarProps {
  monthDay: string; // "MM-DD"
  today: string; // "MM-DD"
  onChange: (monthDay: string) => void;
  summary: string;
}

const CalendarDateBar = ({ monthDay, today, onChange, summary }: CalendarDateBarProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isToday = monthDay === today;

  const step = (delta: 1 | -1) => {
    Haptics.selectionAsync();
    onChange(shiftMonthDay(monthDay, delta));
  };

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Pressable
          onPress={() => step(-1)}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Previous day"
        >
          <Ionicons name="chevron-back" size={18} color={COLOR.accent} />
        </Pressable>

        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.date, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Pick a day of the year. Currently ${formatMonthDay(monthDay)}`}
        >
          <Ionicons name="calendar-outline" size={16} color={COLOR.accent} />
          <Text style={styles.dateLabel} numberOfLines={1}>
            {formatMonthDay(monthDay)}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => step(1)}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Next day"
        >
          <Ionicons name="chevron-forward" size={18} color={COLOR.accent} />
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onChange(today);
          }}
          disabled={isToday}
          style={({ pressed }) => [
            styles.step,
            styles.todayButton,
            isToday && styles.disabled,
            pressed && !isToday && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          accessibilityState={{ disabled: isToday }}
        >
          <Text style={[styles.todayLabel, isToday && styles.disabledLabel]}>Today</Text>
        </Pressable>
      </View>

      <Text style={styles.summary}>{summary}</Text>

      <MonthDayPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={monthDay}
        onChange={onChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
  },
  step: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
  },
  date: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.accentBorder,
    backgroundColor: COLOR.accentSoft,
  },
  dateLabel: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 15,
    color: COLOR.accent,
  },
  todayButton: {
    width: undefined,
    paddingHorizontal: 12,
  },
  todayLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
  disabled: {
    backgroundColor: COLOR.surfaceMuted,
    borderColor: COLOR.border,
  },
  disabledLabel: {
    color: COLOR.disabled,
  },
  pressed: {
    opacity: 0.6,
  },
  summary: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: COLOR.textMuted,
  },
});

export default CalendarDateBar;
