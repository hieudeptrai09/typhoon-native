import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface LegendShellProps {
  label: string;
  accessibilityLabel: string;
  children: ReactNode;
}

export default function LegendShell({ label, accessibilityLabel, children }: LegendShellProps) {
  return (
    <View style={styles.root} accessibilityLabel={accessibilityLabel}>
      <View style={styles.items}>
        <Text style={styles.label}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

interface LegendItemProps {
  label: ReactNode;
  color?: string;
}

export const LegendItem = ({ label, color }: LegendItemProps) => (
  <View style={styles.item}>
    <View style={[styles.swatch, color ? { backgroundColor: color } : styles.swatchEmpty]} />
    {typeof label === "string" ? <Text style={styles.itemLabel}>{label}</Text> : label}
  </View>
);

const styles = StyleSheet.create({
  root: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#cbd5e1",
  },
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 12,
    rowGap: 6,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: "#475569",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  swatchEmpty: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  itemLabel: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: "#475569",
  },
});
