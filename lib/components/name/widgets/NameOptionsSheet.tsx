import DefModal from "@/lib/components/common/DefModal";
import { OptionGroup } from "@/lib/components/common/OptionRow";
import { GRID_CONTENT_OPTIONS, HISTORY_OPTIONS } from "@/lib/components/name/options";

interface NameOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  showHistory: boolean;
  onShowHistoryChange: (showHistory: boolean) => void;
  showName: boolean;
  onShowNameChange: (showName: boolean) => void;
}

const NameOptionsSheet = ({
  open,
  onClose,
  showHistory,
  onShowHistoryChange,
  showName,
  onShowNameChange,
}: NameOptionsSheetProps) => (
  <DefModal open={open} onClose={onClose} title="View options">
    <OptionGroup
      label="Show"
      options={HISTORY_OPTIONS}
      value={showHistory ? "history" : "current"}
      onChange={(value) => onShowHistoryChange(value === "history")}
    />

    <OptionGroup
      label="Each cell shows"
      options={GRID_CONTENT_OPTIONS}
      value={showName ? "name" : "tag"}
      onChange={(value) => onShowNameChange(value === "name")}
    />
  </DefModal>
);

export default NameOptionsSheet;
