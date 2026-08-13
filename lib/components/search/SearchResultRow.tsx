import CountryFlag from "@/lib/components/common/CountryFlag";
import HighlightedName from "@/lib/components/common/HighlightedName";
import NameStatusIcon from "@/lib/components/name/NameStatusIcon";
import { COLOR } from "@/lib/constants/theme";
import type { SearchResult } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

interface SearchResultRowProps {
  result: SearchResult;
  matchAt: number;
  matchLength: number;
}

/**
 * Deliberately thinner than the DataCard the other lists use. Search is scan-and-tap: fitting three
 * times as many candidates on screen beats spelling out every field on each one, and the detail
 * screen one tap away carries the rest.
 */
const SearchResultRow = ({ result, matchAt, matchLength }: SearchResultRowProps) => (
  <View style={styles.row}>
    <NameStatusIcon
      isRetired={result.isRetired}
      retirementReason={result.retirementReason ?? undefined}
      position={result.position}
      size={22}
    />

    <View style={styles.body}>
      <HighlightedName name={result.name} at={matchAt} length={matchLength} style={styles.name} />
      <View style={styles.meta}>
        <CountryFlag country={result.country} size={13} showName />
        {result.replacementName !== null && (
          <Text style={styles.replacement} numberOfLines={1}>
            → {result.replacementName}
          </Text>
        )}
      </View>
    </View>

    <Text style={styles.count}>×{result.stormCount}</Text>
    <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLOR.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 16,
    color: COLOR.text,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  replacement: {
    flexShrink: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  count: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textMuted,
  },
});

export default SearchResultRow;
