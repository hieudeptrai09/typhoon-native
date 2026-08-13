import CountryFlag from "@/lib/components/common/CountryFlag";
import EmptyResults from "@/lib/components/common/EmptyResults";
import ImageCredit from "@/lib/components/common/ImageCredit";
import ImageWithLoader from "@/lib/components/common/ImageWithLoader";
import { COLOR } from "@/lib/constants/theme";
import type { IconName, RetiredName, TyphoonName } from "@/lib/types";
import { capitalize } from "@/lib/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ROW_ICON_COLOR = COLOR.textMuted;

export interface NameDetailsContentProps {
  name: TyphoonName | RetiredName | null;
  hideReplacedBy?: boolean;
  correctSpelling?: string;
  /** Set where the surrounding page already carries a status badge, so it isn't shown twice. */
  hideStatus?: boolean;
}

const InfoRow = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <View style={styles.row}>
    <View style={styles.rowIcon}>{icon}</View>
    <View style={styles.rowBody}>{children}</View>
  </View>
);

const NameDetailsContent = ({
  name,
  hideReplacedBy = false,
  correctSpelling,
  hideStatus = false,
}: NameDetailsContentProps) => {
  if (!name) {
    return (
      <EmptyResults
        icon="file-tray-outline"
        description="No name details available for this external name."
      />
    );
  }

  const replacementName =
    !hideReplacedBy && "replacementName" in name ? name.replacementName : undefined;
  const lastYear = "lastYear" in name ? name.lastYear : undefined;
  const pronunciationFile = name.pronunciationFile?.trim();
  const crossRef: { icon: IconName; label: string; value: string } | undefined = correctSpelling
    ? { icon: "text-outline", label: "Correct spelling", value: correctSpelling }
    : replacementName
      ? { icon: "swap-horizontal-outline", label: "Replaced by", value: replacementName }
      : undefined;

  return (
    <View style={styles.root}>
      {!hideStatus && (
        <View style={[styles.status, name.isRetired ? styles.statusRetired : styles.statusActive]}>
          <View style={[styles.dot, name.isRetired ? styles.dotRetired : styles.dotActive]} />
          <Text
            style={[
              styles.statusLabel,
              name.isRetired ? styles.statusLabelRetired : styles.statusLabelActive,
            ]}
          >
            {name.isRetired ? "Retired" : "Active"}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.meaning}>{name.meaning}</Text>
        {name.description ? <Text style={styles.description}>{name.description}</Text> : null}
      </View>

      {/* Image above the rows rather than beside them: at phone width a side-by-side split leaves
          neither column readable. */}
      {name.image ? (
        <View>
          <ImageWithLoader source={name.image} label={name.name} style={styles.image} />
          <ImageCredit credit={name.imageCredit} />
        </View>
      ) : null}

      <View style={styles.rows}>
        <InfoRow icon={<CountryFlag country={name.country} size={16} />}>
          <Text style={styles.rowText}>
            {name.country} · {name.language}
          </Text>
        </InfoRow>

        {(name.originalText || name.ipa || pronunciationFile) && (
          <InfoRow icon={<Ionicons name="language-outline" size={16} color={ROW_ICON_COLOR} />}>
            {name.originalText ? <Text style={styles.rowStrong}>{name.originalText}</Text> : null}
            {name.ipa ? (
              <Text style={styles.rowText} accessibilityLabel="Pronunciation">
                {name.ipa}
              </Text>
            ) : null}
            {pronunciationFile ? (
              <Pressable
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    `https://www.typhooncommittee.org/tcsounds/${encodeURIComponent(pronunciationFile)}`,
                  )
                }
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Listen to the pronunciation of ${capitalize(name.name.toLowerCase())}`}
              >
                <Ionicons name="volume-high-outline" size={16} color={COLOR.textSecondary} />
              </Pressable>
            ) : null}
          </InfoRow>
        )}

        {lastYear !== undefined && lastYear !== 0 && (
          <InfoRow icon={<Ionicons name="time-outline" size={16} color={ROW_ICON_COLOR} />}>
            <Text style={styles.rowText}>Last used {lastYear}</Text>
          </InfoRow>
        )}

        {crossRef && (
          <InfoRow icon={<Ionicons name={crossRef.icon} size={16} color={ROW_ICON_COLOR} />}>
            <Text style={styles.rowText}>
              {crossRef.label} <Text style={styles.crossRefValue}>{crossRef.value}</Text>
            </Text>
          </InfoRow>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  status: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusRetired: {
    backgroundColor: COLOR.dangerSoft,
  },
  statusActive: {
    backgroundColor: COLOR.successSoft,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotRetired: {
    backgroundColor: COLOR.danger,
  },
  dotActive: {
    backgroundColor: COLOR.success,
  },
  statusLabel: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
  },
  statusLabelRetired: {
    color: COLOR.danger,
  },
  statusLabelActive: {
    color: COLOR.success,
  },
  header: {
    gap: 6,
  },
  meaning: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 17,
    lineHeight: 23,
    color: COLOR.textSecondary,
  },
  description: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: COLOR.textMuted,
  },
  image: {
    width: "100%",
    height: 176,
    borderRadius: 12,
    backgroundColor: COLOR.surfaceSubtle,
  },
  rows: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowIcon: {
    width: 24,
    flexShrink: 0,
    alignItems: "center",
  },
  rowBody: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 8,
    rowGap: 2,
  },
  rowText: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
  },
  rowStrong: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 14,
    color: COLOR.textSecondary,
  },
  crossRefValue: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.accent,
  },
});

export default NameDetailsContent;
