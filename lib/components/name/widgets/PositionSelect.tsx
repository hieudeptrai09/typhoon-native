import { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import OptionPicker, { type PickerOption } from "@/lib/components/common/OptionPicker";
import { GRID_ROWS } from "@/lib/constants";
import { type PositionValue } from "@/lib/types";
import { positionColumnLetter } from "@/lib/utils/position";
import { StyleSheet, Text, View } from "react-native";

const ROW_OPTIONS: PickerOption<number>[] = Array.from({ length: GRID_ROWS }, (_, idx) => ({
  value: idx + 1,
  label: `Row ${idx + 1}`,
}));

const COLUMN_OPTIONS: PickerOption<number>[] = COUNTRY_NAMES.map((country, col) => ({
  value: col,
  label: country,
  hint: positionColumnLetter(col),
}));

interface PositionSelectProps {
  value?: PositionValue;
  onChange?: (value: PositionValue) => void;
  help?: string;
  error?: string;
}

const PositionSelect = ({ value = {}, onChange, help, error }: PositionSelectProps) => (
  <View style={styles.root}>
    <View style={styles.pickers}>
      <View style={styles.row}>
        <OptionPicker
          label="Row"
          placeholder="Row"
          options={ROW_OPTIONS}
          value={value.row === undefined ? [] : [value.row]}
          onChange={(next) => onChange?.({ ...value, row: next[0] })}
        />
      </View>

      <View style={styles.column}>
        <OptionPicker
          label="Country"
          placeholder="Country"
          options={COLUMN_OPTIONS}
          value={value.col === undefined ? [] : [value.col]}
          onChange={(next) => onChange?.({ ...value, col: next[0] })}
          searchable
        />
      </View>
    </View>

    {/* Kept out of the two-column row so it reads as one note about the pair, not about a column */}
    {error ? (
      <Text style={styles.error}>{error}</Text>
    ) : help ? (
      <Text style={styles.help}>{help}</Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  pickers: {
    flexDirection: "row",
    gap: 8,
  },
  row: {
    flex: 2,
  },
  column: {
    flex: 3,
  },
  help: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: "#64748b",
  },
  error: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    color: "#dc2626",
  },
});

export default PositionSelect;
