import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface TextFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
}

const TextField = ({ label, placeholder, value, onChangeText }: TextFieldProps) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>

    <View style={styles.control}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="done"
        accessibilityLabel={label}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Clear ${label}`}
        >
          <Ionicons name="close-circle" size={18} color="#94a3b8" />
        </Pressable>
      )}
    </View>
  </View>
);

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
  input: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: "#0f172a",
    paddingVertical: 10,
  },
});

export default TextField;
