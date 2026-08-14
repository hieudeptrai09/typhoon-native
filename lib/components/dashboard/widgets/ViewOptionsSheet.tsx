import DefModal from "@/lib/components/common/DefModal";
import { OptionGroup } from "@/lib/components/common/OptionRow";
import type { SegmentOption } from "@/lib/components/common/SegmentedControl";

interface ViewOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  filterOptions: SegmentOption[];
  filter: string;
  onFilterChange: (filter: string) => void;
  /** Omitted when the current view only supports one layout. */
  modeOptions?: SegmentOption[];
  mode: string;
  onModeChange: (mode: string) => void;
}

const ViewOptionsSheet = ({
  open,
  onClose,
  filterOptions,
  filter,
  onFilterChange,
  modeOptions,
  mode,
  onModeChange,
}: ViewOptionsSheetProps) => (
  <DefModal open={open} onClose={onClose} title="View options">
    <OptionGroup
      label="Group by"
      options={filterOptions}
      value={filter}
      onChange={onFilterChange}
    />

    {modeOptions && modeOptions.length > 1 && (
      <OptionGroup label="Layout" options={modeOptions} value={mode} onChange={onModeChange} />
    )}
  </DefModal>
);

export default ViewOptionsSheet;
