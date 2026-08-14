import LegendShell from "@/lib/components/common/LegendShell";
import { TAG_ICONS, TagIcon } from "@/lib/components/name/widgets/TagIcon";
import { COLOR } from "@/lib/constants/theme";
import { StyleSheet, Text, View } from "react-native";

// No swatch here: the icon *is* the key, so LegendItem's colour chip would only add an empty square.
export default function TagLegend() {
  return (
    <LegendShell label="Categories:" accessibilityLabel="Name category legend">
      {Object.keys(TAG_ICONS).map((tag) => (
        <View key={tag} style={styles.item}>
          <TagIcon tag={tag} size={13} />
          <Text style={styles.label}>{tag}</Text>
        </View>
      ))}
    </LegendShell>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textBody,
  },
});
