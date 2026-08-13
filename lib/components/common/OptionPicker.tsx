import DefModal from "@/lib/components/common/DefModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export interface PickerOption<T extends string | number = string> {
  value: T;
  label: string;
  /** Right-aligned secondary text, e.g. the column letter next to a country. */
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
  /** Rendered under the field — the native stand-in for antd's Form.Item `extra`. */
  help?: string;
  error?: string;
}

// Replaces the antd <Select>: tapping the field opens a sheet, because a dropdown anchored to a
// field is unusable on a phone once the list is longer than a few rows.
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
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </Pressable>
        ) : (
          <Ionicons name="chevron-down" size={16} color="#94a3b8" />
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
            <Ionicons name="search" size={16} color="#94a3b8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${label.toLowerCase()}`}
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        )}

        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
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
                    color={isSelected ? "#0369a1" : "#cbd5e1"}
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
        </ScrollView>
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
    color: "#334155",
  },
  control: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  controlError: {
    borderColor: "#dc2626",
  },
  pressed: {
    backgroundColor: "#f8fafc",
  },
  value: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: "#0f172a",
  },
  placeholder: {
    color: "#94a3b8",
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
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  searchInput: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: "#0f172a",
  },
  list: {
    maxHeight: 360,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: "#64748b",
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
    backgroundColor: "#f1f5f9",
  },
  optionLabel: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: "#334155",
  },
  optionLabelActive: {
    fontFamily: "OpenSans_600SemiBold",
    color: "#0c4a6e",
  },
  optionHint: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    color: "#94a3b8",
  },
  done: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  doneLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: "#ffffff",
  },
});

export default OptionPicker;
