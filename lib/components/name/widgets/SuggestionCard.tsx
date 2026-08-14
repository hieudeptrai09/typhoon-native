import ImageCredit from "@/lib/components/common/ImageCredit";
import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import { COLOR } from "@/lib/constants/theme";
import type { Suggestion } from "@/lib/types";
import { StyleSheet, Text, View } from "react-native";

interface SuggestionCardProps {
  suggestion: Suggestion;
}

const SuggestionCard = ({ suggestion }: SuggestionCardProps) => {
  const isChosen = Boolean(suggestion.isChosen);

  return (
    <View style={[styles.card, isChosen ? styles.cardChosen : styles.cardPlain]}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {suggestion.replacementName}
        </Text>
        {isChosen && (
          <View style={styles.badge} accessibilityLabel="Approved as official replacement">
            <Text style={styles.badgeLabel}>APPROVED</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.meaning}>{suggestion.replacementMeaning}</Text>

        {suggestion.image ? (
          <View style={styles.imageBlock}>
            <ImageWithLoader
              source={suggestion.image}
              label={suggestion.replacementName}
              style={styles.image}
              spinnerSize="small"
              showErrorLabel={false}
            />
            <ImageCredit credit={suggestion.imageCredit} align="end" />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  cardChosen: {
    backgroundColor: COLOR.accentSoft,
    borderColor: COLOR.accent,
  },
  cardPlain: {
    backgroundColor: COLOR.surfaceMuted,
    borderColor: COLOR.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 16,
    color: COLOR.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: COLOR.accent,
  },
  badgeLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
    color: COLOR.textInverse,
  },
  body: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  meaning: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: COLOR.textBody,
  },
  imageBlock: {
    width: 120,
    flexShrink: 0,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surfaceSunken,
  },
});

export default SuggestionCard;
