import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const LINKS: { href: Href; label: string; description: string; icon: IconName }[] = [
  {
    href: "/info",
    label: "Names A–Z",
    description: "Every name on record, alphabetically",
    icon: "text-outline",
  },
  {
    href: "/positions",
    label: "Positions",
    description: "The 140-slot naming table at a glance",
    icon: "grid-outline",
  },
  {
    href: "/countries",
    label: "Countries",
    description: "The 14 members and the names they gave",
    icon: "flag-outline",
  },
  {
    href: "/years",
    label: "Seasons",
    description: "Every typhoon season since 2000",
    icon: "calendar-outline",
  },
];

const BrowseLinks = () => (
  <View style={styles.root}>
    <Text style={styles.title}>Browse</Text>

    <View style={styles.card}>
      {LINKS.map(({ href, label, description, icon }, index) => (
        <Pressable
          key={label}
          onPress={() => router.push(href)}
          style={({ pressed }) => [
            styles.row,
            index > 0 && styles.rowDivided,
            pressed && styles.pressed,
          ]}
          android_ripple={{ color: COLOR.accentSoft }}
          accessibilityRole="link"
          accessibilityLabel={`${label}. ${description}`}
        >
          <View style={styles.icon}>
            <Ionicons name={icon} size={18} color={COLOR.accent} />
          </View>
          <View style={styles.body}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
        </Pressable>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: SPACE.sm,
  },
  title: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textMuted,
    paddingBottom: SPACE.xs,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: SPACE.sm,
  },
  rowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.border,
  },
  pressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.sm,
    backgroundColor: COLOR.accentSoft,
  },
  body: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.text,
  },
  description: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
});

export default BrowseLinks;
