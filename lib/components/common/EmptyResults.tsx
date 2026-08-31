import { COLOR } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

const EmptyResults = ({
  description = "No typhoon names match your current filters. Try adjusting your search criteria.",
  icon = "funnel-outline",
  action,
}: {
  description?: string;
  icon?: IconName;
  action?: ReactNode;
}) => (
  <View style={styles.root}>
    <Ionicons name={icon} size={56} color={COLOR.textFaint} />
    <Text style={styles.description}>{description}</Text>
    {action ? <View style={styles.action}>{action}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  description: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: COLOR.textMuted,
    textAlign: "center",
  },
  action: {
    marginTop: 4,
  },
});

export default EmptyResults;
