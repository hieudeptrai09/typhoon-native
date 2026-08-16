import { COLOR, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

const ACTIVE = COLOR.accent;
const INACTIVE = COLOR.textMuted;

// Navigates by router rather than wrapping this in <Link asChild>: that path renders through a
// Radix Slot, which merges `style` by object spread and so flattens a style *function* to {} —
// silently dropping both the inset and the pressed state.
const AboutButton = () => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/about")}
      hitSlop={12}
      style={({ pressed }) => [styles.about, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="About this app"
    >
      <Ionicons name="information-circle-outline" size={24} color={COLOR.textInverse} />
    </Pressable>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontFamily: "OpenSans_500Medium", fontSize: 11 },
        sceneStyle: { backgroundColor: COLOR.background },
        headerStyle: { backgroundColor: COLOR.accent },
        headerTintColor: COLOR.textInverse,
        headerTitleStyle: { fontFamily: "OpenSans_600SemiBold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          headerRight: () => <AboutButton />,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "today" : "today-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="storms"
        options={{
          title: "Storms",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "thunderstorm" : "thunderstorm-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="names"
        options={{
          title: "Names",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Mirrors the 16 that react-navigation insets the header title by, so the two edges match.
  about: {
    marginRight: SPACE.lg,
  },
  pressed: {
    opacity: 0.6,
  },
});
