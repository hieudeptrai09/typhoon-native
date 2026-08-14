import type Ionicons from "@expo/vector-icons/Ionicons";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Ionicons glyph name — Ionicons is the only icon set used in the app. */
export type IconName = keyof typeof Ionicons.glyphMap;
