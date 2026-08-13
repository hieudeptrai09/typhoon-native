import DefModal from "@/lib/components/common/DefModal";
import { OptionGroup } from "@/lib/components/common/OptionRow";
import type { SegmentOption } from "@/lib/components/common/SegmentedControl";

interface ViewOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  filterOptions: SegmentOption[];
  filter: string;
  onFilterChange: (filter: string) => void;
  /** Omitted when the current view only supports one layout, rather than shown greyed out. */
  modeOptions?: SegmentOption[];
  mode: string;
  onModeChange: (mode: string) => void;
}

/**
 * Grouping and layout were a permanent two-row filter bar on web. On a phone that is a fifth of
 * the screen spent on controls the user touches once, so they move behind one pill — the same
 * move the sort controls already made.
 */
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
