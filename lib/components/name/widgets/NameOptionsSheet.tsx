import DefModal from "@/lib/components/common/DefModal";
import { OptionGroup } from "@/lib/components/common/OptionRow";
import {
  GRID_CONTENT_OPTIONS,
  LAYOUT_OPTIONS,
  type NamesLayout,
} from "@/lib/components/name/options";

interface NameOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  layout: NamesLayout;
  onLayoutChange: (layout: NamesLayout) => void;
  showName: boolean;
  onShowNameChange: (showName: boolean) => void;
}

const NameOptionsSheet = ({
  open,
  onClose,
  layout,
  onLayoutChange,
  showName,
  onShowNameChange,
}: NameOptionsSheetProps) => (
  <DefModal open={open} onClose={onClose} title="View options">
    <OptionGroup
      label="Layout"
      options={LAYOUT_OPTIONS}
      value={layout}
      onChange={(value) => onLayoutChange(value as NamesLayout)}
    />

    {/* Only the table has cells small enough to have to choose what goes in them. */}
    {layout === "grid" && (
      <OptionGroup
        label="Each cell shows"
        options={GRID_CONTENT_OPTIONS}
        value={showName ? "name" : "tag"}
        onChange={(value) => onShowNameChange(value === "name")}
      />
    )}
  </DefModal>
);

export default NameOptionsSheet;
