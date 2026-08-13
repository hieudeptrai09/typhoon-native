import { COLOR, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

const ACTIVE = COLOR.accent;
const INACTIVE = COLOR.textMuted;

// About was reachable only from the old home footer. A footer is web chrome, so it moves to the
// one header the user always passes through.
const AboutButton = () => (
  <Link href="/about" asChild>
    <Pressable
      hitSlop={12}
      style={({ pressed }) => ({ marginRight: SPACE.lg, opacity: pressed ? 0.6 : 1 })}
      accessibilityRole="button"
      accessibilityLabel="About this app"
    >
      <Ionicons name="information-circle-outline" size={24} color={COLOR.textInverse} />
    </Pressable>
  </Link>
);

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
