import Svg, { Path } from "react-native-svg";

const BODY =
  "M72 6 C80 12 88 30 86 50 A36 36 0 0 1 41 85 Q36 94 28 94 C20 88 12 70 14 50 A36 36 0 0 1 59 15 Q64 6 72 6 Z";
const EYE = "M50 38 A12 12 0 1 1 50 62 A12 12 0 1 1 50 38 Z";

interface TyphoonSymbolProps {
  size: number;
  color: string;
}

// Body and eye share one path so the even-odd rule punches the eye out as a hole.
const TyphoonSymbol = ({ size, color }: TyphoonSymbolProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path fillRule="evenodd" d={`${BODY} ${EYE}`} fill={color} />
  </Svg>
);

export default TyphoonSymbol;
