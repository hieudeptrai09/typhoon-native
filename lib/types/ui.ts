import type Ionicons from "@expo/vector-icons/Ionicons";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type IconName = keyof typeof Ionicons.glyphMap;

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  shortLabel?: string;
  description?: string;
  icon?: IconName;
  // Drawn in place of `icon`.
  swatch?: string;
  // Present means disabled; the row shows the reason.
  blockedReason?: string;
}
