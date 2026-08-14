/**
 * Chrome palette. A colour belongs here when it distinguishes a *state* — pressed, selected,
 * disabled, error. A colour that distinguishes a *value* belongs in colors.ts instead, so that
 * a UI tweak can never repaint a legend.
 */
export const COLOR = {
  text: "#0f172a",
  textSecondary: "#334155",
  textBody: "#475569",
  textMuted: "#64748b",
  textFaint: "#94a3b8",
  textInverse: "#ffffff",

  // `background` and `surfaceMuted` share a value on purpose: a muted fill only ever appears
  // inside a card, never directly on the page.
  background: "#f1f5f9",
  surface: "#ffffff",
  surfaceSubtle: "#f8fafc",
  surfaceMuted: "#f1f5f9",
  surfaceSunken: "#e2e8f0",

  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  /** Foreground of anything switched off. Same value as borderStrong, different intent. */
  disabled: "#cbd5e1",

  accent: "#0369a1",
  accentSoft: "#e0f2fe",
  accentBorder: "#7dd3fc",

  danger: "#dc2626",
  dangerSoft: "#fee2e2",
  success: "#047857",
  successSoft: "#d1fae5",
  warning: "#b45309",
  warningSoft: "#fef3c7",

  overlay: "rgba(15, 23, 42, 0.5)",
  /** Translucent, so blocks on the tinted home hero don't read as pasted-on white cards. */
  onHero: "rgba(255, 255, 255, 0.7)",
} as const;

/** Screen gutters are `lg`; anything tappable clears `HIT_SIZE`. */
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const HIT_SIZE = 48;
