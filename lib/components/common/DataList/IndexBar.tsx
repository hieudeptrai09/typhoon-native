import { COLOR } from "@/lib/constants/theme";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

interface IndexBarProps {
  // Must arrive in the order the list is currently in.
  letters: string[];
  onSelect: (letter: string) => void;
}

const ROW_HEIGHT = 15;

const IndexBar = ({ letters, onSelect }: IndexBarProps) => {
  const [active, setActive] = useState<string | null>(null);
  const lastSent = useRef<string | null>(null);

  if (letters.length < 2) return null;

  // Tracked from the touch position rather than per-letter presses: at 15px a row the letters are
  // below a comfortable tap target.
  const letterAt = (event: GestureResponderEvent) => {
    const index = Math.floor(event.nativeEvent.locationY / ROW_HEIGHT);
    return letters[Math.min(letters.length - 1, Math.max(0, index))];
  };

  const track = (event: GestureResponderEvent) => {
    const letter = letterAt(event);
    if (letter === lastSent.current) return;
    lastSent.current = letter;
    setActive(letter);
    Haptics.selectionAsync();
    onSelect(letter);
  };

  const release = () => {
    lastSent.current = null;
    setActive(null);
  };

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* The responder sits on the letter stack itself, so locationY starts at the first letter
          however the rail ends up centred. */}
      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={track}
        onResponderMove={track}
        onResponderRelease={release}
        onResponderTerminate={release}
        accessibilityRole="adjustable"
        accessibilityLabel="Jump to a letter"
      >
        {/* locationY is measured against whichever view the touch landed on. Letters left
            touchable make each one its own origin, so every tap reads as row 0 — the first
            letter — while only a drag off the letter reports the real offset. */}
        <View pointerEvents="none">
          {letters.map((letter) => (
            <Text key={letter} style={[styles.letter, letter === active && styles.letterActive]}>
              {letter}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    right: 2,
    top: 0,
    bottom: 0,
    width: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  letter: {
    height: ROW_HEIGHT,
    width: 22,
    textAlign: "center",
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 10,
    lineHeight: ROW_HEIGHT,
    color: COLOR.textFaint,
  },
  letterActive: {
    color: COLOR.accent,
    fontFamily: "OpenSans_700Bold",
  },
});

export default IndexBar;
