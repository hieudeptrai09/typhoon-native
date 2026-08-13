import { TITLE_COMMON } from "@/lib/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logo = require("@/assets/images/logo.png");

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      <View style={styles.hero}>
        <Image source={logo} style={styles.logo} contentFit="contain" transition={200} />
        <Text style={styles.tagline}>Track typhoons and explore their names</Text>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.stormsButton, pressed && styles.pressed]}
            onPress={() => router.navigate("/storms")}
            accessibilityRole="button"
          >
            <Ionicons name="thunderstorm" size={20} color="#ffffff" />
            <Text style={styles.buttonLabel}>Browse Storms</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.button, styles.namesButton, pressed && styles.pressed]}
            onPress={() => router.navigate("/names")}
            accessibilityRole="button"
          >
            <Ionicons name="book" size={20} color="#ffffff" />
            <Text style={styles.buttonLabel}>Explore Names</Text>
          </Pressable>
        </View>
      </View>

      {/* Thay cho Footer của bản web: bản native không có footer, chỉ còn lối vào About */}
      <View style={styles.footer}>
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} {TITLE_COMMON}
        </Text>
        <Pressable
          onPress={() => router.push("/about")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="About this app"
        >
          <Text style={styles.aboutLink}>About</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#e0f2fe",
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  logo: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 400 / 134,
  },
  tagline: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 17,
    lineHeight: 24,
    color: "#1e293b",
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 360,
    gap: 12,
    marginTop: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
  },
  stormsButton: {
    backgroundColor: "#2563eb",
  },
  namesButton: {
    backgroundColor: "#0d9488",
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 16,
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  copyright: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  aboutLink: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: "#2563eb",
  },
});
