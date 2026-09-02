import DefModal from "@/lib/components/common/DefModal";
import { OptionGroup } from "@/lib/components/common/OptionRow";
import type { SegmentOption } from "@/lib/types";

export interface OptionAxis {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

interface ViewOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  axes: OptionAxis[];
}

const ViewOptionsSheet = ({ open, onClose, axes }: ViewOptionsSheetProps) => (
  <DefModal open={open} onClose={onClose} title="View options">
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

export default ViewOptionsSheet;
