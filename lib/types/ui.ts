import type Ionicons from "@expo/vector-icons/Ionicons";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Ionicons glyph name — Ionicons is the only icon set used in the app. */
export type IconName = keyof typeof Ionicons.glyphMap;

/** One choice in a picker: the option-row groups and the dashboard filter pills share this shape. */
export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  /** Used wherever the full label would not fit, e.g. the dashboard filter pill. */
  shortLabel?: string;
  /** One line under the label. The only place a view explains itself, so it is not decoration. */
  description?: string;
  icon?: IconName;
  /** Colour chip drawn in place of `icon`, for options whose colour is the thing being picked. */
  swatch?: string;
  /** Why the option cannot be picked. Present means disabled; the row shows the reason. */
  blockedReason?: string;
}
