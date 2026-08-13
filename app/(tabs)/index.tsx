import QuickActionsMenu from "@/lib/components/home/QuickActionsMenu";
import StormHighlightBadge from "@/lib/components/home/StormHighlightBadge";
import { TITLE_COMMON } from "@/lib/constants";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logo = require("@/assets/images/logo.png");

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Centred by flexGrow, not by a flex:1 View: on a short screen the hero scrolls
          instead of clipping. */}
      <ScrollView
        contentContainerStyle={styles.hero}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Image source={logo} style={styles.logo} contentFit="contain" transition={200} />
        <Text style={styles.tagline}>Track typhoons and explore their names</Text>

        <StormHighlightBadge />

        <View style={styles.discover}>
          <QuickActionsMenu />
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.stormsButton, pressed && styles.pressed]}
            onPress={() => router.navigate("/storms")}
            accessibilityRole="button"
          >
            <Ionicons name="thunderstorm" size={20} color={COLOR.textInverse} />
            <Text style={styles.buttonLabel}>Browse Storms</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.button, styles.namesButton, pressed && styles.pressed]}
            onPress={() => router.navigate("/names")}
            accessibilityRole="button"
          >
            <Ionicons name="book" size={20} color={COLOR.accent} />
            <Text style={[styles.buttonLabel, styles.namesLabel]}>Explore Names</Text>
          </Pressable>
        </View>
      </ScrollView>

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
    backgroundColor: COLOR.accentSoft,
  },
  hero: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE.xl,
    paddingVertical: SPACE.xl,
    gap: SPACE.lg,
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
    color: COLOR.text,
    textAlign: "center",
  },
  discover: {
    width: "100%",
    maxWidth: 360,
  },
  actions: {
    width: "100%",
    maxWidth: 360,
    gap: SPACE.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: RADIUS.lg,
  },
  stormsButton: {
    backgroundColor: COLOR.accent,
  },
  namesButton: {
    backgroundColor: COLOR.surface,
    borderWidth: 1,
    borderColor: COLOR.accentBorder,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 16,
    color: COLOR.textInverse,
  },
  namesLabel: {
    color: COLOR.accent,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACE.xl,
    paddingVertical: SPACE.md,
  },
  copyright: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  aboutLink: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
});
