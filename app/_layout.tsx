import { COLOR } from "@/lib/constants/theme";
import {
  OpenSans_400Regular,
  OpenSans_400Regular_Italic,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  useFonts,
} from "@expo-google-fonts/open-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    OpenSans_400Regular,
    OpenSans_400Regular_Italic,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Giữ splash cho tới khi font sẵn sàng, tránh frame đầu render bằng font hệ thống rồi nhảy
  if (!loaded && !error) return null;

  // Gesture handler needs a root view above every screen, or the swipe pagers never receive touches.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: COLOR.background },
          headerStyle: { backgroundColor: COLOR.accent },
          headerTintColor: COLOR.textInverse,
          headerTitleStyle: { fontFamily: "OpenSans_600SemiBold" },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="info/[name]" />
        <Stack.Screen name="positions/[position]" />
        <Stack.Screen name="season" />
        <Stack.Screen name="about" options={{ title: "About" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
