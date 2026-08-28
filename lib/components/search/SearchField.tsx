import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { InteractionManager, Pressable, StyleSheet, TextInput, View } from "react-native";

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

const SearchField = ({
  value,
  onChangeText,
  placeholder = "Search typhoon names",
}: SearchFieldProps) => {
  const input = useRef<TextInput>(null);
  // Read inside the focus effect instead of listed as a dependency, so re-focusing is decided by
  // what is typed *now* without the effect tearing down on every keystroke.
  const typed = useRef(value);
  typed.current = value;

  // Opening the Search tab with nothing typed should land on the keyboard — that is the only reason
  // to be here. Coming back to a query still on screen must not steal it: the user left to read a
  // result and wants the results, not the keyboard, when they return.
  useFocusEffect(
    useCallback(() => {
      if (typed.current !== "") return;

      const task = InteractionManager.runAfterInteractions(() => input.current?.focus());
      return () => task.cancel();
    }, []),
  );

  return (
    <View style={styles.root}>
      <Ionicons name="search" size={18} color={COLOR.textMuted} />

      <TextInput
        ref={input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLOR.textFaint}
        style={styles.input}
        // Names are proper nouns the keyboard would otherwise capitalise and autocorrect into
        // ordinary words, and the query is matched case-insensitively anyway.
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        // Results are already on screen, so submitting only means "dismiss the keyboard".
        onSubmitEditing={() => input.current?.blur()}
        accessibilityLabel="Search typhoon names"
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText("");
            input.current?.focus();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={COLOR.textFaint} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLOR.surfaceSunken,
  },
  input: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: COLOR.text,
    // Android pads its inputs by default, which pushes the text off the row's centre line.
    paddingVertical: 0,
  },
});

export default SearchField;
