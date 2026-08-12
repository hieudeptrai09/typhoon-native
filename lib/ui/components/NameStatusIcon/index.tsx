import type { RetirementReason } from "@/lib/types";
import { getNameStatusColorClass } from "@/lib/utils/colors";
import { isExternalPosition } from "@/lib/utils/position";
import { CircleHelp, Flame, Skull, SpellCheck2 } from "lucide-react";

interface Props {
  isRetired: boolean;
  retirementReason?: RetirementReason;
  size?: number;
  position?: number;
}

export default function NameStatusIcon({
  isRetired,
  retirementReason,
  size = 20,
  position,
}: Props) {
  const isExternal = isExternalPosition(position);
  const colorClass = getNameStatusColorClass({ isRetired, retirementReason, isExternal });
  if (isExternal) {
    return <CircleHelp className={colorClass} size={size} />;
  }
  if (retirementReason === "misspell") {
    return <SpellCheck2 className={colorClass} size={size} />;
  }
  if (isRetired) {
    return <Skull className={colorClass} size={size} />;
  }
  return <Flame className={colorClass} size={size} />;
}
