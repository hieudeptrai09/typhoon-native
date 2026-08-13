import { COLOR } from "@/lib/constants/theme";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

const HighlightedName = ({
  name,
  query,
  style,
}: {
  name: string;
  query: string;
  style?: StyleProp<TextStyle>;
}) => {
  const idx = query.trim() ? name.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (idx === -1) return <Text style={style}>{name}</Text>;

  return (
    <Text style={style}>
      {name.slice(0, idx)}
      <Text style={styles.match}>{name.slice(idx, idx + query.length)}</Text>
      {name.slice(idx + query.length)}
    </Text>
  );
};

const styles = StyleSheet.create({
  match: {
    fontFamily: "OpenSans_700Bold",
    color: COLOR.accent,
  },
});

export default HighlightedName;
