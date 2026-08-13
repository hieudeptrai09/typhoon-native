import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface SectionProps {
  title?: string;
  children: ReactNode;
}

/** Titled card used to block out the detail screens. */
const Section = ({ title, children }: SectionProps) => (
  <View style={styles.root}>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: SPACE.lg,
    padding: SPACE.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
  },
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.textSecondary,
  },
});

export default Section;
