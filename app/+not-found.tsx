import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  const router = useRouter();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    });

    return () => {
      cancelled = true;
    };
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <SafeAreaView style={styles.screen}>
        <View style={styles.code} accessibilityLabel="404 — Page not found">
          <Text style={styles.digit}>4</Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="aperture-outline" size={88} color={COLOR.accent} />
          </Animated.View>
          <Text style={styles.digit}>4</Text>
        </View>

        <Text style={styles.headline}>This page drifted off the map</Text>
        <Text style={styles.body}>
          It may have moved, or been swept away by a storm.{"\n"}
          Let&rsquo;s get you back on course.
        </Text>

        <View style={styles.links}>
          <Pressable style={styles.link} onPress={() => router.replace("/")} hitSlop={8}>
            <Ionicons name="home-outline" size={18} color={COLOR.accent} />
            <Text style={styles.linkLabel}>Home</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={() => router.replace("/storms")} hitSlop={8}>
            <Ionicons name="thunderstorm-outline" size={18} color={COLOR.accent} />
            <Text style={styles.linkLabel}>Browse storms</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={() => router.replace("/names")} hitSlop={8}>
            <Ionicons name="pricetag-outline" size={18} color={COLOR.accent} />
            <Text style={styles.linkLabel}>Explore names</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: COLOR.accentSoft,
  },
  code: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  digit: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 80,
    lineHeight: 92,
    color: COLOR.accent,
    fontVariant: ["tabular-nums"],
  },
  headline: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
    color: COLOR.text,
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: COLOR.textBody,
    textAlign: "center",
    marginBottom: 36,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 24,
    rowGap: 12,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.accent,
  },
});
