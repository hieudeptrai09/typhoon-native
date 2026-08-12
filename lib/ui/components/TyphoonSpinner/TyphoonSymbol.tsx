const BODY =
  "M72 6 C80 12 88 30 86 50 A36 36 0 0 1 41 85 Q36 94 28 94 C20 88 12 70 14 50 A36 36 0 0 1 59 15 Q64 6 72 6 Z";
const EYE = "M50 38 A12 12 0 1 1 50 62 A12 12 0 1 1 50 38 Z";

const TyphoonSymbol = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg viewBox="0 0 100 100" className={className} style={style}>
    <path fillRule="evenodd" d={`${BODY} ${EYE}`} fill="currentColor" />
  </svg>
);

export default TyphoonSymbol;
