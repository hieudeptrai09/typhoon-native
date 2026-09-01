import DefModal from "@/lib/components/common/DefModal";
import OptionPicker from "@/lib/components/common/OptionPicker";
import TextField from "@/lib/components/common/TextField";
import type { NamesScope } from "@/lib/components/name/options";
import PositionSelect from "@/lib/components/name/widgets/PositionSelect";
import { RETIRED_REASON_LABEL } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type {
  BaseModalProps,
  FilterParams,
  PositionValue,
  RetiredFilterParams,
  RetirementReason,
} from "@/lib/types";
import { ALPHABET } from "@/lib/utils/name/filters";
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

export type NameFilters = FilterParams | RetiredFilterParams;

interface NameFilterSheetProps<T extends NameFilters> extends BaseModalProps {
  scope: NamesScope;
  initialFilters: T;
  countries: string[];
  languages?: string[];
  tags?: string[];
  matchCount: (filters: T) => number;
  onApply: (filters: T) => void;
}

interface FormValues {
  name: string;
  letter: string[];
  country: string[];
  language: string[];
  tag: string[];
  position: PositionValue;
  year: string[];
  reason: string[];
}

const LETTER_OPTIONS = toOpts(ALPHABET);

const FIRST_YEAR = 2000;

const YEAR_OPTIONS = Array.from({ length: new Date().getFullYear() - FIRST_YEAR + 1 }, (_, idx) =>
  String(new Date().getFullYear() - idx),
).map((year) => ({ value: year, label: year }));

const REASON_OPTIONS = Object.entries(RETIRED_REASON_LABEL).map(([value, label]) => ({
  value: value as RetirementReason,
  label,
}));

const toFilters = (values: FormValues, scope: NamesScope): NameFilters => {
  const position = positionFromValue(values.position);
  const shared = {
    name: values.name ?? "",
    letter: values.letter[0] ?? "",
    country: toStr(values.country),
    position: position != null ? String(position) : "",
  };

  if (scope === "retired") {
    return { ...shared, year: values.year[0] ?? "", reason: toStr(values.reason) };
  }

  // Status is not a field here: "retired only" is the Retired tab, so the grid never asks.
  return { ...shared, language: toStr(values.language), tag: toStr(values.tag), status: "" };
};

const NameFilterSheet = <T extends NameFilters>({
  isOpen,
  onClose,
  onApply,
  scope,
  initialFilters,
  countries,
  languages = [],
  tags = [],
  matchCount,
}: NameFilterSheetProps<T>) => {
  const isRetired = scope === "retired";

  const buildOpenValues = (): FormValues => {
    const seed = initialFilters as Partial<FilterParams & RetiredFilterParams>;
    return {
      name: seed.name ?? "",
      letter: seed.letter ? [seed.letter] : [],
      country: toArr(seed.country ?? ""),
      language: toArr(seed.language ?? ""),
      tag: toArr(seed.tag ?? ""),
      position: positionToValue(seed.position ? Number(seed.position) : null),
      year: seed.year ? [seed.year] : [],
      reason: toArr(seed.reason ?? ""),
    };
  };

  const [values, setValues] = useState<FormValues>(buildOpenValues);

  // The sheet stays mounted between opens, so the fields have to be re-seeded on each one.
  useEffect(() => {
    if (isOpen) setValues(buildOpenValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const position = positionFromValue(values.position);
  const isIncomplete = isPartialPosition(values.position);
  const pending = toFilters(values, scope) as T;
  const filled = pending as Partial<FilterParams & RetiredFilterParams>;
  const hasFilters = Boolean(
    filled.name ||
    filled.letter ||
    filled.country ||
    filled.position ||
    filled.language ||
    filled.tag ||
    filled.year ||
    filled.reason,
  );
  const count = hasFilters ? matchCount(pending) : null;
  const noun = isRetired ? "retired name" : "name";

  const handleClearAll = () =>
    setValues({
      name: "",
      letter: [],
      country: [],
      language: [],
      tag: [],
      position: positionToValue(null),
      year: [],
      reason: [],
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
            onPress={() => onApply(pending)}
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
                : `Apply filters, ${count} ${count === 1 ? noun : `${noun}s`} match`
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
          label="Starts With"
          placeholder="Any letter"
          options={LETTER_OPTIONS}
          value={values.letter}
          onChange={(letter) => update("letter", letter)}
        />

        {isRetired && (
          <OptionPicker
            label="Year"
            placeholder="Select year..."
            options={YEAR_OPTIONS}
            value={values.year}
            onChange={(year) => update("year", year)}
          />
        )}

        <OptionPicker
          multiple
          searchable
          label="Contributed By"
          placeholder="All Countries"
          options={toOpts(countries)}
          value={values.country}
          onChange={(country) => update("country", country)}
        />

        {!isRetired && (
          <>
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
          </>
        )}

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

        {isRetired && (
          <OptionPicker
            multiple
            label="Retirement Reason"
            placeholder="All Reasons"
            options={REASON_OPTIONS}
            value={values.reason}
            onChange={(reason) => update("reason", reason)}
          />
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

export default NameFilterSheet;
