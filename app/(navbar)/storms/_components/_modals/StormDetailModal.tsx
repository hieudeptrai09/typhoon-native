import DefModal from "@/lib/components/DefModal";
import IntensityBadge from "@/lib/components/IntensityBadge";
import type { BaseModalProps, Storm } from "@/lib/types";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";

export interface StormDetailModalProps extends BaseModalProps {
  title: string;
  storms: Storm[];
}

// It's used to a part of modal @modal/(.)positions/[position], but the owner forced to divorce and go back to here.
const StormDetailModal = ({ isOpen, onClose, title, storms }: StormDetailModalProps) => {
  const groupedByName = storms.reduce<Record<string, Storm[]>>((acc, storm) => {
    if (!acc[storm.name]) acc[storm.name] = [];
    acc[storm.name].push(storm);
    return acc;
  }, {});

  const nameGroups = Object.entries(groupedByName);
  const hasMultipleNames = nameGroups.length > 1;

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      width={448}
      title={<span className="text-2xl font-bold text-foreground">{title}</span>}
    >
      <div className="flex flex-col pt-4 pb-px">
        {nameGroups.map(([name, stormGroup], groupIndex) => (
          <div key={name} className="flex flex-col gap-1.5">
            {stormGroup.map((storm, index) => (
              <div key={index} className="flex items-center">
                <IntensityBadge intensity={storm.intensity} />
                <span
                  className="ml-1.5"
                  style={{ color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }}
                >
                  {storm.name} {storm.year}
                  {storm.jtwcDesignation && ` (${storm.jtwcDesignation})`}
                </span>
              </div>
            ))}

            {hasMultipleNames && groupIndex < nameGroups.length - 1 && (
              <div className="my-3 border-b border-gray-300" />
            )}
          </div>
        ))}
      </div>
    </DefModal>
  );
};

export default StormDetailModal;
