import DefModal from "@/lib/components/common/DefModal";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps, StormHistoryEntry, TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface HistoryModalProps extends BaseModalProps {
  position: number;
  positionNames: TyphoonName[];
  storms: StormHistoryEntry[];
}

const HistoryModal = ({ isOpen, onClose, position, positionNames, storms }: HistoryModalProps) => {
  if (!isOpen) return null;

  const stormsByName = storms.reduce<Record<string, StormHistoryEntry[]>>((acc, storm) => {
    (acc[storm.name] ??= []).push(storm);
    return acc;
  }, {});

  const firstYearOf = (name: TyphoonName) => {
    const used = stormsByName[name.name] ?? [];
    return used.length > 0 ? Math.min(...used.map((storm) => storm.year)) : Infinity;
  };

  const sortedNames = [...positionNames].sort((a, b) => firstYearOf(a) - firstYearOf(b));

  const openName = (name: string) => {
    onClose();
    router.push(`/info/${encodeURIComponent(name)}`);
  };

  return (
    <DefModal open={isOpen} onClose={onClose} title={getPositionTitle(position)}>
      {positionNames.length === 0 ? (
        <Text style={styles.empty}>No names at this position.</Text>
      ) : (
        <View style={styles.list}>
          {sortedNames.map((name) => {
            const nameStorms = stormsByName[name.name] ?? [];
            const years = nameStorms.map((storm) => storm.year).join(", ");

            return (
              <Pressable
                key={name.id}
                onPress={() => openName(name.name)}
                style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`${name.name}, used ${nameStorms.length} times. Open its page.`}
              >
                <Text style={styles.count}>x{nameStorms.length}</Text>

                <View style={styles.body}>
                  <Text style={styles.nameLine}>
                    <Text style={[styles.name, { color: getNameStatusColor(name) }]}>
                      {name.name}
                    </Text>
                    {nameStorms.length > 0 ? <Text style={styles.years}> ({years})</Text> : null}
                    {name.language ? <Text style={styles.language}> · {name.language}</Text> : null}
                  </Text>

                  {name.meaning ? <Text style={styles.meaning}>{name.meaning}</Text> : null}
                </View>

                <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
              </Pressable>
            );
          })}
        </View>
      )}
    </DefModal>
  );
};

const styles = StyleSheet.create({
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
  list: {
    gap: 4,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  pressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  count: {
    minWidth: 30,
    fontFamily: "OpenSans_700Bold",
    fontSize: 13,
    color: COLOR.textBody,
    fontVariant: ["tabular-nums"],
  },
  body: {
    flex: 1,
    gap: 2,
  },
  nameLine: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
  },
  name: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
  },
  years: {
    fontSize: 13,
    color: COLOR.textBody,
  },
  language: {
    fontSize: 12,
    color: COLOR.textMuted,
  },
  meaning: {
    fontFamily: "OpenSans_400Regular_Italic",
    fontSize: 12,
    lineHeight: 18,
    color: COLOR.textBody,
  },
});

export default HistoryModal;
