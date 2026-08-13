import { COLOR, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

/**
 * A refresh failed over data already on screen. Replacing a working screen with a full error page
 * punishes the pull gesture, so the failure says so in one line and gets out of the way.
 */
const StaleBanner = () => (
  <View style={styles.root}>
    <Ionicons name="cloud-offline-outline" size={14} color={COLOR.warning} />
    <Text style={styles.text}>Couldn&apos;t refresh — showing the last data loaded.</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.sm,
    backgroundColor: COLOR.warningSoft,
  },
  text: {
    flex: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    color: COLOR.warning,
  },
});

export default StaleBanner;
