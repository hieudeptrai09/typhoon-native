import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

const FrownError = ({
  description = "Something went wrong. Please try again later.",
  onRetry,
}: {
  description?: string;
  onRetry?: () => void;
} = {}) => (
  <View style={styles.root}>
    <Ionicons name="sad-outline" size={64} color="#9ca3af" />
    <Text style={styles.description}>{description}</Text>

    {onRetry && (
      // Retry is the only action here on purpose: the tab bar already carries the escape routes,
      // so repeating them would just compete with it.
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <Ionicons name="refresh" size={16} color="#ffffff" />
        <Text style={styles.retryLabel}>Try again</Text>
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  description: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: "#64748b",
    textAlign: "center",
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 22,
    backgroundColor: "#475569",
  },
  pressed: {
    opacity: 0.85,
  },
  retryLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: "#ffffff",
  },
});

export default FrownError;
