import * as Haptics from "expo-haptics";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

interface MenuProps {
  href: Href;
  label: string;
  bgColor: string;
}

/** Full-width pill that navigates — the home screen's primary call to action. */
const Menu = ({ href, label, bgColor }: MenuProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        router.navigate(href);
      }}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: bgColor },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 19,
    color: "#ffffff",
  },
});

export default Menu;
