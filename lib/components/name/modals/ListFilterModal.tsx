import DefModal from "@/lib/components/common/DefModal";
import OptionPicker from "@/lib/components/common/OptionPicker";
import SegmentedControl from "@/lib/components/common/SegmentedControl";
import TextField from "@/lib/components/common/TextField";
import PositionSelect from "@/lib/components/name/widgets/PositionSelect";
import { COLOR } from "@/lib/constants/theme";
import { type BaseModalProps, type FilterParams, type PositionValue } from "@/lib/types";
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

export interface ListFilterModalProps extends BaseModalProps {
  onApply: (filters: FilterParams) => void;
  countries: string[];
  languages: string[];
  tags: string[];
  initialFilters: FilterParams;
  showHistory: boolean;
  matchCount: (filters: FilterParams) => number;
}

interface FormValues {
  name: string;
  country: string[];
  language: string[];
  tag: string[];
  position: PositionValue;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "retired", label: "Retired" },
];

const toFilters = (values: FormValues): FilterParams => {
  const position = positionFromValue(values.position);
  return {
    name: values.name ?? "",
    country: toStr(values.country),
    language: toStr(values.language),
    tag: toStr(values.tag),
    position: position != null ? String(position) : "",
    status: values.status ?? "",
    letter: "",
  };
};

const ListFilterModal = ({
  isOpen,
  onClose,
  onApply,
  countries,
  languages,
  tags,
  initialFilters,
  showHistory,
  matchCount,
}: ListFilterModalProps) => {
  const buildOpenValues = (): FormValues => ({
    name: initialFilters.name,
    country: toArr(initialFilters.country),
    language: toArr(initialFilters.language),
    tag: toArr(initialFilters.tag),
    position: positionToValue(initialFilters.position ? Number(initialFilters.position) : null),
    status: showHistory ? initialFilters.status || "" : "current",
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
    pending.name ||
    pending.country ||
    pending.language ||
    pending.tag ||
    pending.position ||
    (showHistory && pending.status),
  );
  const count = hasFilters ? matchCount(pending) : null;

  const handleClearAll = () =>
    setValues({
      name: "",
      country: [],
      language: [],
      tag: [],
      position: positionToValue(null),
      status: showHistory ? "" : "current",
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
                : `Apply filters, ${count} ${count === 1 ? "name" : "names"} match`
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
          multiple
          searchable
          label="Contributed By"
          placeholder="All Countries"
          options={toOpts(countries)}
          value={values.country}
          onChange={(country) => update("country", country)}
        />

        <OptionPicker
          multiple
          searchable
          label="Language"
          placeholder="All Languages"
          options={toOpts(languages)}
          value={values.language}
          onChange={(language) => update("language", language)}
        />

        <OptionPicker
          multiple
          searchable
          label="Tag"
          placeholder="All Tags"
          options={toOpts(tags)}
          value={values.tag}
          onChange={(tag) => update("tag", tag)}
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

        {showHistory && (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Status</Text>
            <SegmentedControl
              options={STATUS_OPTIONS}
              value={values.status}
              onChange={(status) => update("status", status)}
              accessibilityLabel="Filter by status"
            />
          </View>
        )}
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
    color: COLOR.textSecondary,
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
    borderColor: COLOR.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  clearLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.textBody,
  },
  apply: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLOR.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  applyDisabled: {
    backgroundColor: COLOR.borderStrong,
  },
  applyLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textInverse,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default ListFilterModal;
