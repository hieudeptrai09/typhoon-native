import CN from "country-flag-icons/react/3x2/CN";
import FM from "country-flag-icons/react/3x2/FM";
import HK from "country-flag-icons/react/3x2/HK";
import JP from "country-flag-icons/react/3x2/JP";
import KH from "country-flag-icons/react/3x2/KH";
import KP from "country-flag-icons/react/3x2/KP";
import KR from "country-flag-icons/react/3x2/KR";
import LA from "country-flag-icons/react/3x2/LA";
import MO from "country-flag-icons/react/3x2/MO";
import MY from "country-flag-icons/react/3x2/MY";
import PH from "country-flag-icons/react/3x2/PH";
import TH from "country-flag-icons/react/3x2/TH";
import US from "country-flag-icons/react/3x2/US";
import VN from "country-flag-icons/react/3x2/VN";

export const COUNTRY_FLAG_COMPONENTS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Cambodia: KH,
  China: CN,
  "DPR Korea": KP,
  "HK, China": HK,
  Japan: JP,
  "Laos PDR": LA,
  "Macao, China": MO,
  Malaysia: MY,
  Micronesia: FM,
  Philippines: PH,
  "RO Korea": KR,
  Thailand: TH,
  "U.S.A.": US,
  Vietnam: VN,
};

export const COUNTRY_NAMES = Object.keys(COUNTRY_FLAG_COMPONENTS);

interface CountryFlagProps {
  country: string;
  className?: string;
}

const CountryFlag = ({ country, className = "h-7 w-10" }: CountryFlagProps) => {
  const FlagComponent = COUNTRY_FLAG_COMPONENTS[country];
  if (!FlagComponent) return <span className="text-foreground">{country}</span>;

  return (
    <span
      className={`inline-block overflow-hidden rounded border border-gray-300 shadow-sm ${className}`}
      title={country}
      role="img"
      aria-label={`Flag of ${country}`}
    >
      <FlagComponent className="h-full w-full object-cover" />
    </span>
  );
};

export default CountryFlag;
