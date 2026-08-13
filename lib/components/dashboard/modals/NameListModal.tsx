import DefModal from "@/lib/components/common/DefModal";
import StormListContent from "@/lib/components/storm/StormListContent";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { BaseModalProps, Storm } from "@/lib/types";
import { getIntensityFromNumber } from "@/lib/utils/storm/aggregate";
import { StyleSheet, Text } from "react-native";

export interface NameListModalProps extends BaseModalProps {
  name: string;
  storms: Storm[];
  avgIntensity?: number;
}

const NameListModal = ({ isOpen, onClose, name, storms, avgIntensity = 0 }: NameListModalProps) => {
  if (!storms || storms.length === 0) return null;

  const color = TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(avgIntensity)];

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      title={
        <Text style={[styles.title, { color }]} numberOfLines={1}>
          {name}
        </Text>
      }
    >
      <StormListContent storms={storms} />
    </DefModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
  },
});

export default NameListModal;
