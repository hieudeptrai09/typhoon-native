import { COLOR } from "@/lib/constants/theme";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";

export const TAG_ICONS: Record<string, IconName> = {
  Animal: "paw-outline",
  "Celestial body": "moon-outline",
  Concept: "library-outline",
  Deity: "flash-outline",
  Descriptive: "pricetag-outline",
  "Food and beverage": "fast-food-outline",
  Mineral: "diamond-outline",
  Nature: "cloudy-outline",
  "People's name": "person-outline",
  Place: "location-outline",
  Plant: "leaf-outline",
  Thing: "hammer-outline",
};

interface TagIconProps {
  tag: string;
  size?: number;
  colorOverride?: string;
}

export const TagIcon = ({ tag, size = 18, colorOverride }: TagIconProps) => {
  const icon = TAG_ICONS[tag];
  if (!icon) return null;
  return <Ionicons name={icon} size={size} color={colorOverride || COLOR.textBody} />;
};
