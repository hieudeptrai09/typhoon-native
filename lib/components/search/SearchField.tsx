import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const SearchField = ({
  value,
  onChangeText,
  isLoading = false,
  placeholder = "Search typhoon names",
}: SearchFieldProps) => (
  <View style={styles.root}>
    <Ionicons name="search" size={18} color="#64748b" />

    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      style={styles.input}
      // Names are proper nouns the keyboard would otherwise capitalise and autocorrect into
      // ordinary words, and the query is matched case-insensitively anyway.
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      accessibilityLabel="Search typhoon names"
    />

    {isLoading ? (
      <ActivityIndicator size="small" color="#64748b" />
    ) : value.length > 0 ? (
      <Pressable
        onPress={() => onChangeText("")}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Clear search"
      >
        <Ionicons name="close-circle" size={18} color="#94a3b8" />
      </Pressable>
    ) : null}
  </View>
);

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
    backgroundColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: "#1e293b",
    // Android pads its inputs by default, which pushes the text off the row's centre line.
    paddingVertical: 0,
  },
});

export default SearchField;
