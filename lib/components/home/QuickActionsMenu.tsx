import ActiveStorms from "@/lib/components/home/ActiveStorms";
import FunFacts from "@/lib/components/home/FunFacts";
import OnThisDay from "@/lib/components/home/OnThisDay";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

// Web hid these behind a popover next to the search box, because the header had no room. The
// native home screen has the room, and each entry already opens its own sheet — nesting a popover
// in front of that would only add a tap.
const QuickActionsMenu = () => (
  <View style={styles.root}>
    <View style={styles.header}>
      <Ionicons name="sparkles-outline" size={16} color={COLOR.accent} />
      <Text style={styles.title}>Discover</Text>
    </View>

    <View style={styles.actions}>
      <OnThisDay />
      <ActiveStorms />
      <FunFacts />
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: SPACE.xs,
    padding: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLOR.accentBorder,
    backgroundColor: COLOR.onHero,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.xs,
  },
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.accent,
  },
  actions: {
    gap: 2,
  },
});

export default QuickActionsMenu;
