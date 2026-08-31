import DefModal from "@/lib/components/common/DefModal";
import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export interface PickerOption<T extends string | number = string> {
  value: T;
  label: string;
  hint?: string;
}

interface OptionPickerProps<T extends string | number = string> {
  label: string;
  placeholder: string;
  options: PickerOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  help?: string;
  error?: string;
}

const OptionPicker = <T extends string | number = string>({
  label,
  placeholder,
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  help,
  error,
}: OptionPickerProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => new Set(value), [value]);

  const visible = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options;
    return options.filter((option) => option.label.toLowerCase().includes(trimmed));
  }, [options, query]);

  const summary = options
    .filter((option) => selected.has(option.value))
    .map((option) => option.label)
    .join(", ");

  const open = () => {
    setQuery("");
    setIsOpen(true);
  };

  const toggle = (optionValue: T) => {
    Haptics.selectionAsync();

    if (!multiple) {
      onChange(selected.has(optionValue) ? [] : [optionValue]);
      setIsOpen(false);
      return;
    }

    const next = new Set(selected);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onChange([...next]);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={open}
        style={({ pressed }) => [
          styles.control,
          error && styles.controlError,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: summary || placeholder }}
      >
        <Text style={[styles.value, !summary && styles.placeholder]} numberOfLines={1}>
          {summary || placeholder}
        </Text>

        {summary ? (
          <Pressable
            onPress={() => onChange([])}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label}`}
          >
            <Ionicons name="close-circle" size={18} color={COLOR.textFaint} />
          </Pressable>
        ) : (
          <Ionicons name="chevron-down" size={16} color={COLOR.textFaint} />
        )}
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : help ? (
        <Text style={styles.help}>{help}</Text>
      ) : null}

      <DefModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
        footer={
          multiple ? (
            <Pressable
              onPress={() => setIsOpen(false)}
              style={styles.done}
              accessibilityRole="button"
            >
              <Text style={styles.doneLabel}>Done</Text>
            </Pressable>
          ) : undefined
        }
      >
        {searchable && (
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={COLOR.textFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${label.toLowerCase()}`}
              placeholderTextColor={COLOR.textFaint}
              style={styles.searchInput}
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        )}

        {/* Plain View, not a scroller: the sheet body already scrolls, and nesting two vertical
            ScrollViews makes them fight over the drag on Android. */}
        <View style={styles.list}>
          {visible.length === 0 ? (
            <Text style={styles.empty}>No matches.</Text>
          ) : (
            visible.map((option) => {
              const isSelected = selected.has(option.value);

              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => toggle(option.value)}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={option.label}
                >
                  <Ionicons
                    name={
                      multiple
                        ? isSelected
                          ? "checkbox"
                          : "square-outline"
                        : isSelected
                          ? "radio-button-on"
                          : "radio-button-off"
                    }
                    size={20}
                    color={isSelected ? COLOR.accent : COLOR.disabled}
                  />
                  <Text
                    style={[styles.optionLabel, isSelected && styles.optionLabelActive]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                  {option.hint ? <Text style={styles.optionHint}>{option.hint}</Text> : null}
                </Pressable>
              );
            })
          )}
        </View>
      </DefModal>
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textSecondary,
  },
  control: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
  },
  controlError: {
    borderColor: COLOR.danger,
  },
  pressed: {
    backgroundColor: COLOR.surfaceSubtle,
  },
  value: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: COLOR.text,
  },
  placeholder: {
    color: COLOR.textFaint,
  },
  help: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: COLOR.textMuted,
  },
  error: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    color: COLOR.danger,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: COLOR.surfaceMuted,
  },
  searchInput: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: COLOR.text,
  },
  list: {
    gap: 2,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
    textAlign: "center",
    paddingVertical: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  optionPressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  optionLabel: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: COLOR.textSecondary,
  },
  optionLabelActive: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.accent,
  },
  optionHint: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    color: COLOR.textFaint,
  },
  done: {
    height: 44,
    borderRadius: 12,
    backgroundColor: COLOR.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  doneLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textInverse,
  },
});

export default OptionPicker;
