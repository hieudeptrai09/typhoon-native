import DefModal from "@/lib/components/common/DefModal";
import OptionPicker from "@/lib/components/common/OptionPicker";
import TextField from "@/lib/components/common/TextField";
import PositionSelect from "@/lib/components/name/widgets/PositionSelect";
import {
  type BaseModalProps,
  type PositionValue,
  type RetiredFilterParams,
  type RetirementReason,
} from "@/lib/types";
import { toOpts } from "@/lib/utils/name/selectOptions";
import { toArr, toStr } from "@/lib/utils/params";
import {
  getPositionTitle,
  isPartialPosition,
  positionFromValue,
  positionToValue,
} from "@/lib/utils/position";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RetiredFilterModalProps extends BaseModalProps {
  onApply: (filters: RetiredFilterParams) => void;
  countries: string[];
  initialFilters: RetiredFilterParams;
  matchCount: (filters: RetiredFilterParams) => number;
}

interface FormValues {
  name: string;
  year: string[];
  country: string[];
  reason: string[];
  position: PositionValue;
}

const FIRST_YEAR = 2000;

// The web build used a year DatePicker; a list is both shorter to reach and easier to hit here.
const YEAR_OPTIONS = Array.from({ length: new Date().getFullYear() - FIRST_YEAR + 1 }, (_, idx) =>
  String(new Date().getFullYear() - idx),
).map((year) => ({ value: year, label: year }));

const REASON_OPTIONS: { value: RetirementReason; label: string }[] = [
  { value: "destructive", label: "Destructive Storm" },
  { value: "language", label: "Language Problem" },
  { value: "misspell", label: "Misspelling" },
  { value: "special", label: "Special Storm" },
];

const toFilters = (values: FormValues): RetiredFilterParams => {
  const position = positionFromValue(values.position);
  return {
    name: values.name ?? "",
    year: values.year[0] ?? "",
    country: toStr(values.country),
    reason: toStr(values.reason),
    position: position != null ? String(position) : "",
    letter: "",
  };
};

const RetiredFilterModal = ({
  isOpen,
  onClose,
  onApply,
  countries,
  initialFilters,
  matchCount,
}: RetiredFilterModalProps) => {
  const buildOpenValues = (): FormValues => ({
    name: initialFilters.name,
    year: initialFilters.year ? [initialFilters.year] : [],
    country: toArr(initialFilters.country),
    reason: toArr(initialFilters.reason),
    position: positionToValue(initialFilters.position ? Number(initialFilters.position) : null),
  });

  const [values, setValues] = useState<FormValues>(buildOpenValues);

  // antd's Form re-seeded itself from initialValues on every open; plain state has to be told.
  useEffect(() => {
    if (isOpen) setValues(buildOpenValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const position = positionFromValue(values.position);
  const isIncomplete = isPartialPosition(values.position);
  const pending = toFilters(values);
  const hasFilters = Boolean(
    pending.name || pending.year || pending.country || pending.reason || pending.position,
  );
  const count = hasFilters ? matchCount(pending) : null;

  const handleClearAll = () =>
    setValues({
      name: "",
      year: [],
      country: [],
      reason: [],
      position: positionToValue(null),
    });

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      title="Filter Options"
      footer={
        <View style={styles.footer}>
          <Pressable
            onPress={handleClearAll}
            style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Text style={styles.clearLabel}>Clear All</Text>
          </Pressable>

          <Pressable
            onPress={() => onApply(toFilters(values))}
            disabled={isIncomplete}
            style={({ pressed }) => [
              styles.apply,
              isIncomplete && styles.applyDisabled,
              pressed && !isIncomplete && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: isIncomplete }}
            accessibilityLabel={
              count == null
                ? "Apply filters"
                : `Apply filters, ${count} retired ${count === 1 ? "name" : "names"} match`
            }
          >
            <Text style={styles.applyLabel}>{count == null ? "Apply" : `Apply (${count})`}</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.form}>
        <TextField
          label="Name"
          placeholder="Enter typhoon name..."
          value={values.name}
          onChangeText={(name) => update("name", name)}
        />

        <OptionPicker
          label="Year"
          placeholder="Select year..."
          options={YEAR_OPTIONS}
          value={values.year}
          onChange={(year) => update("year", year)}
        />

        <OptionPicker
          multiple
          searchable
          label="Contributed By"
          placeholder="All Countries"
          options={toOpts(countries)}
          value={values.country}
          onChange={(country) => update("country", country)}
        />

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Position</Text>
          <PositionSelect
            value={values.position}
            onChange={(next) => update("position", next)}
            error={isIncomplete ? "Pick both a row and a country" : undefined}
            help={
              position != null
                ? `Cell ${getPositionTitle(position)} — position #${position} in the naming table`
                : "Pick the row and the contributing country of the cell in the naming table"
            }
          />
        </View>

        <OptionPicker
          multiple
          label="Retirement Reason"
          placeholder="All Reasons"
          options={REASON_OPTIONS}
          value={values.reason}
          onChange={(reason) => update("reason", reason)}
        />
      </View>
    </DefModal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  group: {
    gap: 6,
  },
  groupLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: "#334155",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clear: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  clearLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#475569",
  },
  apply: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  applyDisabled: {
    backgroundColor: "#cbd5e1",
  },
  applyLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.7,
  },
});

export default RetiredFilterModal;
