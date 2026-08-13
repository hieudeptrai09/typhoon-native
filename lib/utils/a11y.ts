import type { KeyboardEvent } from "react";

export const onEnterKeyDown =
  (onActivate: () => void) =>
  (e: KeyboardEvent): void => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    onActivate();
  };

export const clickableRowProps = (ariaLabel: string, onClick: () => void) => ({
  onClick,
  onKeyDown: onEnterKeyDown(onClick),
  role: "button" as const,
  tabIndex: 0,
  "aria-label": ariaLabel,
});
