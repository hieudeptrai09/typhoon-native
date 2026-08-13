import DefModal from "@/lib/components/common/DefModal";
import ImageCredit from "@/lib/components/common/ImageCredit";
import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import type { BaseModalProps, StormHistoryEntry, TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

interface HistoryModalProps extends BaseModalProps {
  position: number;
  positionNames: TyphoonName[];
  storms: StormHistoryEntry[];
}

const HistoryModal = ({ isOpen, onClose, position, positionNames, storms }: HistoryModalProps) => {
  const [expandedState, setExpandedState] = useState<{ position: number; nameId: number } | null>(
    null,
  );

  if (!isOpen) return null;

  const expandedNameId = expandedState?.position === position ? expandedState.nameId : null;

  const stormsByName: Record<string, StormHistoryEntry[]> = {};
  storms.forEach((storm) => {
    if (!stormsByName[storm.name]) stormsByName[storm.name] = [];
    stormsByName[storm.name].push(storm);
  });

  const sortedNames = [...positionNames].sort((a, b) => {
    const aStorms = stormsByName[a.name] || [];
    const bStorms = stormsByName[b.name] || [];
    const aFirst = aStorms.length > 0 ? Math.min(...aStorms.map((storm) => storm.year)) : Infinity;
    const bFirst = bStorms.length > 0 ? Math.min(...bStorms.map((storm) => storm.year)) : Infinity;
    return aFirst - bFirst;
  });

  const handleNamePress = (nameId: number) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedState((previous) =>
      previous?.position === position && previous.nameId === nameId ? null : { position, nameId },
    );
  };

  return (
    <DefModal
      open={isOpen}
      onClose={() => {
        setExpandedState(null);
        onClose();
      }}
      title={getPositionTitle(position)}
    >
      {positionNames.length === 0 ? (
        <Text style={styles.empty}>No names at this position.</Text>
      ) : (
        <View style={styles.list}>
          {sortedNames.map((name) => {
            const nameStorms = stormsByName[name.name] || [];
            const count = nameStorms.length;
            const years = nameStorms.map((storm) => storm.year).join(", ");
            const isExpanded = expandedNameId === name.id;
            const hasExpandable = Boolean(name.image);

            return (
              <View key={name.id} style={styles.entry}>
                <Pressable
                  disabled={!hasExpandable}
                  onPress={() => handleNamePress(name.id)}
                  style={({ pressed }) => [
                    styles.head,
                    isExpanded && styles.headExpanded,
                    pressed && hasExpandable && styles.pressed,
                  ]}
                  accessibilityRole={hasExpandable ? "button" : "text"}
                  accessibilityState={hasExpandable ? { expanded: isExpanded } : undefined}
                  accessibilityLabel={`${name.name}, used ${count} times`}
                >
                  <Text style={styles.count}>x{count}</Text>

                  <View style={styles.entryBody}>
                    <Text style={styles.nameLine}>
                      <Text style={[styles.name, { color: getNameStatusColor(name) }]}>
                        {name.name}
                      </Text>
                      {count > 0 ? <Text style={styles.years}> ({years})</Text> : null}
                      {name.language ? (
                        <Text style={styles.language}> · {name.language}</Text>
                      ) : null}
                    </Text>

                    {name.meaning ? <Text style={styles.meaning}>{name.meaning}</Text> : null}
                    {name.description ? (
                      <Text style={styles.description}>{name.description}</Text>
                    ) : null}
                  </View>

                  {hasExpandable && (
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={14}
                      color="#94a3b8"
                    />
                  )}
                </Pressable>

                {isExpanded && name.image && (
                  <View style={styles.imagePanel}>
                    <View style={styles.imageBox}>
                      <ImageWithLoader
                        source={name.image}
                        label={name.name}
                        style={styles.image}
                        spinnerSize="small"
                      />
                      <ImageCredit credit={name.imageCredit} align="center" />
                    </View>
                  </View>
                )}
              </View>
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
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 20,
  },
  list: {
    gap: 4,
  },
  entry: {
    overflow: "hidden",
    borderRadius: 10,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  headExpanded: {
    backgroundColor: "#f0f9ff",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  pressed: {
    backgroundColor: "#f1f5f9",
  },
  count: {
    minWidth: 30,
    fontFamily: "OpenSans_700Bold",
    fontSize: 13,
    color: "#475569",
    fontVariant: ["tabular-nums"],
  },
  entryBody: {
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
    color: "#475569",
  },
  language: {
    fontSize: 12,
    color: "#64748b",
  },
  meaning: {
    fontFamily: "OpenSans_400Regular_Italic",
    fontSize: 12,
    lineHeight: 18,
    color: "#0f766e",
  },
  description: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },
  imagePanel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
  },
  imageBox: {
    alignSelf: "center",
    width: 160,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
  },
});

export default HistoryModal;
