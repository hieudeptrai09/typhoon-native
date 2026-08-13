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

    // Bản web tắt animation qua prefers-reduced-motion; native đọc cùng thiết lập đó từ hệ điều hành
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
        {/* 404 — vòng xoáy bão thay cho số 0 ở giữa */}
        <View style={styles.code} accessibilityLabel="404 — Page not found">
          <Text style={styles.digit}>4</Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="aperture-outline" size={88} color="#0369a1" />
          </Animated.View>
          <Text style={styles.digit}>4</Text>
        </View>

        <Text style={styles.headline}>This page drifted off the map</Text>
        <Text style={styles.body}>
          It may have moved, or been swept away by a storm.{"\n"}
          Let&rsquo;s get you back on course.
        </Text>

        {/* Link nhẹ thay vì nút to, để ngõ cụt vẫn nhẹ nhàng */}
        <View style={styles.links}>
          <Pressable style={styles.link} onPress={() => router.replace("/")} hitSlop={8}>
            <Ionicons name="home-outline" size={18} color="#0369a1" />
            <Text style={styles.linkLabel}>Home</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={() => router.replace("/storms")} hitSlop={8}>
            <Ionicons name="thunderstorm-outline" size={18} color="#0369a1" />
            <Text style={styles.linkLabel}>Browse storms</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={() => router.replace("/names")} hitSlop={8}>
            <Ionicons name="pricetag-outline" size={18} color="#0369a1" />
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
    backgroundColor: "#e0f2fe",
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
    color: "#075985",
    fontVariant: ["tabular-nums"],
  },
  headline: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
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
    color: "#0369a1",
  },
});
