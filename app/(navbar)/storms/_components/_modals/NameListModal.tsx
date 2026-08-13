import DefModal from "@/lib/components/DefModal";
import StormListContent from "@/lib/components/StormListContent";
import type { BaseModalProps, Storm } from "@/lib/types";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { getIntensityFromNumber } from "@/lib/utils/storms";
import type { CSSProperties } from "react";

// It's used to a part of modal @modal/(.)info/[name], but the owner forced to divorce and go back to here.
export interface NameListModalProps extends BaseModalProps {
  name: string;
  storms: Storm[];
  avgIntensity?: number;
}

const NameListModal = ({ isOpen, onClose, name, storms, avgIntensity = 0 }: NameListModalProps) => {
  const titleStyle: CSSProperties = {
    color: TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(avgIntensity)],
  };

  if (!storms || storms.length === 0) return null;

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      width={512}
      title={
        <span className="text-2xl font-bold" style={titleStyle}>
          {name}
        </span>
      }
    >
      <div className="pt-4">
        <StormListContent storms={storms} />
      </div>
    </DefModal>
  );
};

export default NameListModal;
