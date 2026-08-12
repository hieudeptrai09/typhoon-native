import DefModal from "@/lib/components/DefModal";
import NameDetailsContent from "@/lib/components/NameDetailsContent";
import type { BaseModalProps, RetiredName, TyphoonName } from "@/lib/types";
import { getNameStatusColorClass } from "@/lib/utils/colors";

// It's used to a part of modal @modal/(.)info/name, but the owner forced to divorce and go back to here.
interface NameDetailsModalProps extends BaseModalProps {
  name: TyphoonName | RetiredName;
  hideReplacedBy?: boolean;
}

const NameDetailsModal = ({ isOpen, onClose, name, hideReplacedBy }: NameDetailsModalProps) => {
  const titleColorClass = getNameStatusColorClass(name);

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      width={560}
      title={<span className={`text-2xl font-bold ${titleColorClass}`}>{name.name}</span>}
    >
      <div className="pt-4">
        <NameDetailsContent name={name} hideReplacedBy={hideReplacedBy} />
      </div>
    </DefModal>
  );
};

export default NameDetailsModal;
