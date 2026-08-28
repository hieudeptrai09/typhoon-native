import DefModal from "@/lib/components/common/DefModal";
import { OptionGroup } from "@/lib/components/common/OptionRow";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { SegmentOption } from "@/lib/types";
import { StyleSheet, Text } from "react-native";

export interface OptionAxis {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

interface ViewOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  /** Names the view the axes below belong to; the tab strip only shows its label. */
  subtitle: string;
  axes: OptionAxis[];
}

const ViewOptionsSheet = ({ open, onClose, subtitle, axes }: ViewOptionsSheetProps) => (
  <DefModal open={open} onClose={onClose} title="View options">
    <Text style={styles.subtitle}>{subtitle}</Text>

    {axes.map((axis) => (
      <OptionGroup
        key={axis.label}
        label={axis.label}
        options={axis.options}
        value={axis.value}
        onChange={axis.onChange}
      />
    ))}
  </DefModal>
);

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
    color: COLOR.textMuted,
    marginBottom: SPACE.lg,
  },
});

export default ViewOptionsSheet;
