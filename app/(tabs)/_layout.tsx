import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

const ACTIVE = "#2563eb";
const INACTIVE = "#64748b";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontFamily: "OpenSans_500Medium", fontSize: 11 },
        sceneStyle: { backgroundColor: "#f5f5f4" },
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontFamily: "OpenSans_600SemiBold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
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
