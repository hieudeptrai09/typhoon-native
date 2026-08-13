import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface DataField {
  label: string;
  value: ReactNode;
  /** Prose (meanings, notes) needs the full row rather than a half-width column. */
  wide?: boolean;
}

interface DataCardProps {
  /** 1-based rank shown in the leading badge — the old "#" column. */
  ordinal?: number;
  title: ReactNode;
  titleColor?: string;
  subtitle?: ReactNode;
  /** Rendered opposite the title: a year, a badge, a count. */
  trailing?: ReactNode;
  /** Left edge bar, used to carry the row's status colour. */
  accentColor?: string;
  fields?: DataField[];
  pressable?: boolean;
}

const asNode = (value: ReactNode, style: object): ReactNode =>
  typeof value === "string" || typeof value === "number" ? (
    <Text style={style}>{value}</Text>
  ) : (
    value
  );

const DataCard = ({
  ordinal,
  title,
  titleColor,
  subtitle,
  trailing,
  accentColor,
  fields,
  pressable = false,
}: DataCardProps) => (
  <View style={styles.card}>
    {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}

    <View style={styles.main}>
      <View style={styles.titleRow}>
        {ordinal !== undefined && (
          <View style={styles.ordinal}>
            <Text style={styles.ordinalText}>{ordinal}</Text>
          </View>
        )}

        <View style={styles.titleBlock}>
          {asNode(title, { ...styles.title, ...(titleColor ? { color: titleColor } : null) })}
          {subtitle !== undefined && asNode(subtitle, styles.subtitle)}
        </View>

        {trailing !== undefined && (
          <View style={styles.trailing}>{asNode(trailing, styles.trailingText)}</View>
        )}
        {pressable && <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />}
      </View>

      {fields && fields.length > 0 && (
        <View style={styles.fields}>
          {fields.map((field) => (
            <View key={field.label} style={field.wide ? styles.fieldWide : styles.field}>
              <Text style={styles.fieldLabel}>{field.label.toUpperCase()}</Text>
              {asNode(field.value, styles.fieldValue)}
            </View>
          ))}
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLOR.surface,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  accent: {
    width: 4,
  },
  main: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ordinal: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    backgroundColor: COLOR.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ordinalText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 16,
    color: COLOR.text,
  },
  subtitle: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  trailing: {
    alignItems: "flex-end",
  },
  trailingText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.textSecondary,
  },
  fields: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  field: {
    width: "50%",
    gap: 2,
    paddingRight: 8,
  },
  fieldWide: {
    width: "100%",
    gap: 2,
  },
  fieldLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.6,
    color: COLOR.textFaint,
  },
  fieldValue: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    lineHeight: 19,
    color: COLOR.text,
  },
});

export default DataCard;
