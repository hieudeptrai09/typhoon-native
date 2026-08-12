import TyphoonSymbol from "./TyphoonSymbol";
import "./styles.css";

type TyphoonSpinnerSize = "small" | "medium" | "large";

const sizeMap: Record<TyphoonSpinnerSize, number> = {
  small: 24,
  medium: 36,
  large: 56,
};

const TyphoonSpinner = ({
  size = "medium",
  colorClass = "text-sky-700",
}: {
  size?: TyphoonSpinnerSize;
  colorClass?: string;
}) => {
  const px = sizeMap[size];

  return (
    <div
      className="typhoon-spinner"
      role="status"
      aria-label="Loading"
      style={{ width: px, height: px }}
    >
      <TyphoonSymbol className={colorClass} style={{ width: px, height: px }} />
    </div>
  );
};

export default TyphoonSpinner;
