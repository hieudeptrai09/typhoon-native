import { COLOR } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface DataField {
  label: string;
  value: ReactNode;
}

interface DataCardProps {
  ordinal?: number;
  title: ReactNode;
  titleColor?: string;
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
        </View>

        {pressable && <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />}
      </View>

      {fields && fields.length > 0 && (
        <View style={styles.fields}>
          {fields.map((field, index, all) => {
            // Every cell is exactly half the row, so an even index is always the left column.
            const isLeft = index % 2 === 0;
            const spansRow = isLeft && index === all.length - 1;
            return (
              <View
                key={field.label}
                style={[styles.field, spansRow ? styles.fieldFull : isLeft && styles.fieldGutter]}
              >
                <Text style={styles.fieldLabel}>{field.label.toUpperCase()}</Text>
                {asNode(field.value, styles.fieldValue)}
              </View>
            );
          })}
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
  },
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 16,
    color: COLOR.text,
  },
  fields: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  field: {
    width: "50%",
    gap: 2,
  },
  fieldGutter: {
    paddingRight: 12,
  },
  fieldFull: {
    width: "100%",
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
