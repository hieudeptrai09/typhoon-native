import DefModal from "@/lib/components/common/DefModal";
import { COLOR } from "@/lib/constants/theme";
import { parseMonthDay, toMonthDay } from "@/lib/utils/date";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

// The OS picker only ever speaks in whole dates, so a year-less month-day rides on a fixed
// reference year. It has to be a leap year or 29 February stops being selectable at all.
const REFERENCE_YEAR = 2000;
const FIRST_DAY = new Date(REFERENCE_YEAR, 0, 1);
const LAST_DAY = new Date(REFERENCE_YEAR, 11, 31);

const toDate = (monthDay: string): Date => {
  const parts = parseMonthDay(monthDay);
  return parts ? new Date(REFERENCE_YEAR, parts.month - 1, parts.day) : FIRST_DAY;
};

interface MonthDayPickerProps {
  open: boolean;
  onClose: () => void;
  value: string; // "MM-DD"
  onChange: (monthDay: string) => void;
}

const MonthDayPicker = ({ open, onClose, value, onChange }: MonthDayPickerProps) => {
  // iOS never reports a dismissal, so every event there is a pick.
  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "set" && date) onChange(toMonthDay(date.getMonth() + 1, date.getDate()));
    onClose();
  };

  const picker = (
    <DateTimePicker
      value={toDate(value)}
      mode="date"
      display={Platform.OS === "ios" ? "inline" : "calendar"}
      // Pins the picker inside the reference year, so its header year is inert.
      minimumDate={FIRST_DAY}
      maximumDate={LAST_DAY}
      onChange={handleChange}
      accentColor={COLOR.accent}
      // The app has one palette; without this the picker follows the device into dark mode and
      // renders dark-on-dark inside a white sheet.
      themeVariant="light"
    />
  );

  // Android puts the picker in a dialog of its own; iOS renders it inline and needs a sheet.
  if (Platform.OS !== "ios") return open ? picker : null;

  return (
    <DefModal open={open} onClose={onClose} title="Pick a day">
      {picker}
    </DefModal>
  );
};

export default MonthDayPicker;
