import DefModal from "@/lib/components/common/DefModal";
import IntensityBadge from "@/lib/components/storm/IntensityBadge";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps, Storm } from "@/lib/types";
import { StyleSheet, Text, View } from "react-native";

export interface StormDetailModalProps extends BaseModalProps {
  title: string;
  storms: Storm[];
}

const StormDetailModal = ({ isOpen, onClose, title, storms }: StormDetailModalProps) => {
  const groupedByName = storms.reduce<Record<string, Storm[]>>((acc, storm) => {
    if (!acc[storm.name]) acc[storm.name] = [];
    acc[storm.name].push(storm);
    return acc;
  }, {});

  const nameGroups = Object.entries(groupedByName);
  const hasMultipleNames = nameGroups.length > 1;

  return (
    <DefModal open={isOpen} onClose={onClose} title={title}>
      <View>
        {nameGroups.map(([name, stormGroup], groupIndex) => (
          <View key={name} style={styles.group}>
            {stormGroup.map((storm, index) => (
              <View key={index} style={styles.storm}>
                <IntensityBadge intensity={storm.intensity} size={30} />
                <Text
                  style={[styles.label, { color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }]}
                >
                  {storm.name} {storm.year}
                  {storm.jtwcDesignation ? ` (${storm.jtwcDesignation})` : ""}
                </Text>
              </View>
            ))}

            {hasMultipleNames && groupIndex < nameGroups.length - 1 && (
              <View style={styles.divider} />
            )}
          </View>
        ))}
      </View>
    </DefModal>
  );
};

const styles = StyleSheet.create({
  group: {
    gap: 6,
  },
  storm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    flex: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 15,
  },
  divider: {
    marginVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.borderStrong,
  },
});

export default StormDetailModal;
