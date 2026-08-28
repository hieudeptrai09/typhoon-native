import { COLOR } from "@/lib/constants/theme";
import { StyleSheet, Text, View } from "react-native";

// The grid's 14 columns are these countries in this order, so the map doubles as
// the column definition — keep insertion order.
export const COUNTRY_CODES: Record<string, string> = {
  Cambodia: "KH",
  China: "CN",
  "DPR Korea": "KP",
  "HK, China": "HK",
  Japan: "JP",
  "Laos PDR": "LA",
  "Macao, China": "MO",
  Malaysia: "MY",
  Micronesia: "FM",
  Philippines: "PH",
  "RO Korea": "KR",
  Thailand: "TH",
  "U.S.A.": "US",
  Vietnam: "VN",
};

export const COUNTRY_NAMES = Object.keys(COUNTRY_CODES);

const REGIONAL_INDICATOR_A = 0x1f1e6;

const toFlagEmoji = (code: string): string =>
  code
    .split("")
    .map((char) => String.fromCodePoint(REGIONAL_INDICATOR_A + char.charCodeAt(0) - 65))
    .join("");

interface CountryFlagProps {
  country: string;
  size?: number;
  showName?: boolean;
}

const CountryFlag = ({ country, size = 20, showName = false }: CountryFlagProps) => {
  const code = COUNTRY_CODES[country];

  if (!code) {
    return (
      <Text style={[styles.fallback, { fontSize: size * 0.6 }]} numberOfLines={1}>
        {country || "—"}
      </Text>
    );
  }

  return (
    <View style={styles.row} accessible accessibilityLabel={country}>
      {/* No fontFamily: the emoji has to fall through to the system emoji font */}
      <Text style={{ fontSize: size }}>{toFlagEmoji(code)}</Text>
      {showName && (
        <Text style={styles.name} numberOfLines={1}>
          {country}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    color: COLOR.textSecondary,
  },
  fallback: {
    fontFamily: "OpenSans_500Medium",
    color: COLOR.textMuted,
  },
});

export default CountryFlag;
