import { Button } from "antd";
import type { ReactNode } from "react";

interface SlashToggleButtonProps {
  active: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}

// Icon toggle where a diagonal slash marks the feature as currently OFF
// (the EyeOff/MicOff convention), so the slash reads as state, not action.
const SlashToggleButton = ({ active, onClick, title, children }: SlashToggleButtonProps) => (
  <Button
    type="text"
    onClick={onClick}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className="h-auto! w-auto! p-1! text-foreground! hover:bg-transparent! hover:text-highlight!"
  >
    <span className="relative flex h-[30px] w-[30px] items-center justify-center">
      {children}
      {!active && (
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 h-10 w-[2.5px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current"
        />
      )}
    </span>
  </Button>
);

export default SlashToggleButton;
