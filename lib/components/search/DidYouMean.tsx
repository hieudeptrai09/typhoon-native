import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Fuzzy-matched alternatives for a name that wasn't found. Renders nothing when nothing
// came close, so callers can drop it in unconditionally.
const DidYouMean = ({ names }: { names: string[] }) => {
  if (names.length === 0) return null;

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Did you mean</Text>
      <View style={styles.chips}>
        {names.map((name) => (
          <Link
            key={name}
            href={{ pathname: "/info/[name]", params: { name: name.toLowerCase() } }}
            asChild
          >
            <Pressable
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              accessibilityRole="link"
            >
              <Text style={styles.chipLabel}>{name.toLowerCase()}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#334155",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  chip: {
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
  },
  pressed: {
    opacity: 0.7,
  },
  chipLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#0369a1",
    textTransform: "capitalize",
  },
});

export default DidYouMean;
