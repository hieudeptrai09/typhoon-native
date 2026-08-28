import { SPECIAL_POSITIONS } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface SpecialValue {
  color: string;
  suffix?: string;
}

interface SpecialButtonsProps {
  onPress: (position: number) => void;
  values?: Record<number, SpecialValue>;
}

// CPHC, NHC and IMD name storms outside the naming table, so they have no cell on the grid. The
// lists reach them as ordinary rows; the grid needs this strip or they vanish with the layout.
const SpecialButtons = ({ onPress, values }: SpecialButtonsProps) => (
  <View style={styles.root}>
    <Text style={styles.heading}>Other Regions</Text>
    <View style={styles.row}>
      {SPECIAL_POSITIONS.map((button) => {
        const { color, suffix } = values?.[button.id] ?? { color: COLOR.textSecondary };

        return (
          <Pressable
            key={button.id}
            onPress={() => {
              Haptics.selectionAsync();
              onPress(button.id);
            }}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`View storms from ${button.label} region`}
          >
            <Text style={[styles.label, { color }]}>{button.label}</Text>
            {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  heading: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.textMuted,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 92,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 14,
  },
  suffix: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 11,
    color: COLOR.textMuted,
    fontVariant: ["tabular-nums"],
  },
});

export default SpecialButtons;
