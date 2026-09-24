import Section from "@/lib/components/common/Section";
import { COLOR, HIT_SIZE, RADIUS, SPACE } from "@/lib/constants/theme";
import type { RetiredName, Storm } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SeasonNameChangesProps {
  // Names whose last season this was.
  retiredNames: RetiredName[];
  // The storms that first carried their name, in start-date order.
  debuts: Storm[];
}

const openName = (name: string) => router.push(`/info/${encodeURIComponent(name.toLowerCase())}`);

const RetiredNameRow = ({ name }: { name: RetiredName }) => {
  const statusColor = getNameStatusColor(name);
  const status = name.isRetired ? "Retired" : "Replaced";

  return (
    <Pressable
      onPress={() => openName(name.name)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      android_ripple={{ color: COLOR.accentSoft }}
      accessibilityRole="link"
      accessibilityLabel={`${name.name}, ${getPositionTitle(name.position)}, ${status.toLowerCase()}. Open name.`}
    >
      <View style={[styles.dot, { backgroundColor: statusColor }]} />

      <View style={styles.body}>
        <View style={styles.nameLine}>
          <Text style={[styles.name, { color: statusColor }]}>{name.name}</Text>
          <Text style={styles.position}>{getPositionTitle(name.position)}</Text>
        </View>

        <View style={styles.statusLine}>
          <Text style={[styles.status, { color: statusColor }]}>
            {status}
            {name.replacementName ? " by" : ""}
          </Text>
          {name.replacementName ? (
            <Pressable
              onPress={() => openName(name.replacementName)}
              hitSlop={10}
              style={({ pressed }) => [styles.replacement, pressed && styles.pressed]}
              accessibilityRole="link"
              accessibilityLabel={`Open replacement name ${name.replacementName}`}
            >
              <Text style={styles.replacementLabel}>{name.replacementName}</Text>
              <Ionicons name="chevron-forward" size={12} color={COLOR.accent} />
            </Pressable>
          ) : null}
        </View>

        {name.note ? <Text style={styles.note}>{name.note}</Text> : null}
      </View>

      <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
    </Pressable>
  );
};

const DebutChip = ({ storm }: { storm: Storm }) => (
  <Pressable
    onPress={() => openName(storm.name)}
    style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
    accessibilityRole="link"
    accessibilityLabel={`${storm.name}, ${getPositionTitle(storm.position)}. Open name.`}
  >
    <Text style={styles.chipName}>{storm.name}</Text>
    <Text style={styles.chipPosition}>{getPositionTitle(storm.position)}</Text>
  </Pressable>
);

const SeasonNameChanges = ({ retiredNames, debuts }: SeasonNameChangesProps) => (
  <Section title="Name Changes">
    <View style={styles.group}>
      <Text style={styles.groupTitle}>Retired / Replaced ({retiredNames.length})</Text>
      {retiredNames.length === 0 ? (
        <Text style={styles.none}>None this season.</Text>
      ) : (
        <View>
          {retiredNames.map((name) => (
            <RetiredNameRow key={name.id} name={name} />
          ))}
        </View>
      )}
    </View>

    <View style={styles.group}>
      <Text style={styles.groupTitle}>Debuted ({debuts.length})</Text>
      {debuts.length === 0 ? (
        <Text style={styles.none}>None this season.</Text>
      ) : (
        <View style={styles.chips}>
          {debuts.map((storm) => (
            <DebutChip key={storm.name} storm={storm} />
          ))}
        </View>
      )}
    </View>
  </Section>
);

const styles = StyleSheet.create({
  group: {
    gap: SPACE.sm,
  },
  groupTitle: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.textSecondary,
  },
  none: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.md,
    minHeight: HIT_SIZE,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.sm,
  },
  rowPressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 7,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  nameLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: SPACE.sm,
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 16,
  },
  position: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  statusLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: SPACE.xs,
  },
  status: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
  },
  replacement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  replacementLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 12,
    color: COLOR.accent,
  },
  pressed: {
    opacity: 0.6,
  },
  note: {
    fontFamily: "OpenSans_400Regular_Italic",
    fontSize: 12,
    lineHeight: 18,
    color: COLOR.textMuted,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: HIT_SIZE - 8,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.borderStrong,
    backgroundColor: COLOR.surface,
  },
  chipPressed: {
    backgroundColor: COLOR.accentSoft,
  },
  chipName: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.success,
  },
  chipPosition: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
});

export default SeasonNameChanges;
