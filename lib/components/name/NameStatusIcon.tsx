import type { RetirementReason } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { isExternalPosition } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";

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
  const color = getNameStatusColor({ isRetired, retirementReason, isExternal });
  if (isExternal) {
    return <Ionicons name="help-circle-outline" color={color} size={size} />;
  }
  if (retirementReason === "misspell") {
    return <Ionicons name="text-outline" color={color} size={size} />;
  }
  if (isRetired) {
    return <Ionicons name="skull-outline" color={color} size={size} />;
  }
  return <Ionicons name="flame-outline" color={color} size={size} />;
}
