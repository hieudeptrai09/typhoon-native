import type { IntensityType } from "@/lib/types";
import { BACKGROUND_BADGE, TEXT_COLOR_BADGE } from "@/lib/utils/colors";

interface IntensityBadgeProps {
  intensity: IntensityType;
}

const IntensityBadge = ({ intensity }: IntensityBadgeProps) => {
  return (
    <span
      style={{
        backgroundColor: BACKGROUND_BADGE[intensity],
        color: TEXT_COLOR_BADGE[intensity],
      }}
      aria-label={`Intensity ${intensity}`}
      className="inline-block h-10 w-10 text-center text-base leading-10 font-semibold"
    >
      {intensity}
    </span>
  );
};

export default IntensityBadge;
