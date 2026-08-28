import type { IconName, Storm } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

export const hasHighlight = (storm: Storm): boolean =>
  storm.isStrongest === true || storm.isFirst === true || storm.isLast === true;

interface BadgeProps {
  icon: IconName;
  label: string;
  color: string;
  background: string;
}

const Badge = ({ icon, label, color, background }: BadgeProps) => (
  <View style={[styles.badge, { backgroundColor: background }]}>
    <Ionicons name={icon} size={10} color={color} />
    <Text style={[styles.label, { color }]}>{label}</Text>
  </View>
);

const StormHighlightBadges = ({ storm }: { storm: Storm }) => {
  if (!hasHighlight(storm)) return null;

  return (
    <View style={styles.root}>
      {storm.isStrongest && (
        <Badge icon="flash-outline" label="Strongest" color="#be123c" background="#fecdd3" />
      )}
      {storm.isFirst && (
        <Badge icon="medal-outline" label="First" color="#1d4ed8" background="#bfdbfe" />
      )}
      {storm.isLast && (
        <Badge icon="download-outline" label="Last" color="#c2410c" background="#fed7aa" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 10,
  },
});

export default StormHighlightBadges;
