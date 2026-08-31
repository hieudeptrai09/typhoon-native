import { COLOR } from "@/lib/constants/theme";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

interface HighlightedNameProps {
  name: string;
  // Passed in rather than found here: accent folding means a plain `indexOf` on the raw name can
  // miss what actually matched.
  at: number;
  length: number;
  style?: StyleProp<TextStyle>;
}

const HighlightedName = ({ name, at, length, style }: HighlightedNameProps) => {
  if (at < 0 || length <= 0 || at + length > name.length) {
    return (
      <Text style={style} numberOfLines={1}>
        {name}
      </Text>
    );
  }

  return (
    <Text style={style} numberOfLines={1}>
      {name.slice(0, at)}
      <Text style={styles.match}>{name.slice(at, at + length)}</Text>
      {name.slice(at + length)}
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
