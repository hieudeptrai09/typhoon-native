import { COLOR } from "@/lib/constants/theme";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface LetterConfig {
  isAvailable: boolean;
  color: string;
  isActive?: boolean;
}

interface LetterNavigationProps {
  onLetterChange: (letter: string) => void;
  getLetterConfig: (letter: string) => LetterConfig;
}

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LetterNavigation = ({ onLetterChange, getLetterConfig }: LetterNavigationProps) => (
  <View style={styles.root} accessibilityRole="tablist" accessibilityLabel="Filter by letter">
    {ALL_LETTERS.map((letter) => {
      const { isAvailable, color, isActive } = getLetterConfig(letter);

      return (
        <Pressable
          key={letter}
          disabled={!isAvailable}
          onPress={() => {
            Haptics.selectionAsync();
            onLetterChange(letter);
          }}
          style={({ pressed }) => [
            styles.letter,
            isActive && styles.letterActive,
            pressed && styles.letterPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Filter by letter ${letter}`}
          accessibilityState={{ disabled: !isAvailable, selected: isActive }}
        >
          <Text style={[styles.label, { color }]}>{letter}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    rowGap: 4,
  },
  // Wide enough for a comfortable tap target while still fitting 8-9 letters per row on a phone.
  letter: {
    minWidth: 36,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  letterActive: {
    borderBottomColor: COLOR.accent,
    backgroundColor: COLOR.accentSoft,
  },
  letterPressed: {
    backgroundColor: COLOR.surfaceSunken,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
  },
});

export default LetterNavigation;
