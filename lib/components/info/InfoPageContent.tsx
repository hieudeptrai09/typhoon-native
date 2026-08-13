import CountryFlag from "@/lib/components/common/CountryFlag";
import { useRefreshControl } from "@/lib/components/common/RefreshContext";
import Section from "@/lib/components/common/Section";
import StaleBanner from "@/lib/components/common/StaleBanner";
import NameDetailsContent from "@/lib/components/name/NameDetailsContent";
import NameStatusIcon from "@/lib/components/name/NameStatusIcon";
import StormCard from "@/lib/components/storm/StormCard";
import StormStats from "@/lib/components/storm/StormStats";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import type { RetiredName, RetirementReason, SearchDetail, Storm, TyphoonName } from "@/lib/types";
import { getNameStatusBgColor, getNameStatusColor } from "@/lib/utils/colors";
import { isExternalPosition } from "@/lib/utils/position";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface InfoPageContentProps {
  detail: SearchDetail | null;
  name: string;
  /** A refresh failed over data already on screen — worth saying, not worth a full error page. */
  staleError?: boolean;
}

function StatusBadge({
  isInPosition,
  isRetired,
  retirementReason,
}: {
  isInPosition: boolean;
  isRetired: boolean;
  retirementReason?: RetirementReason;
}) {
  const status = { isRetired, retirementReason, isExternal: !isInPosition };
  const label = !isInPosition
    ? "External name"
    : retirementReason === "misspell"
      ? "Misspelling"
      : isRetired
        ? "Retired"
        : "Active";

  return (
    <View style={[styles.badge, { backgroundColor: getNameStatusBgColor(status) }]}>
      <Text style={[styles.badgeLabel, { color: getNameStatusColor(status) }]}>{label}</Text>
    </View>
  );
}

export default function InfoPageContent({
  detail,
  name,
  staleError = false,
}: InfoPageContentProps) {
  const refreshControl = useRefreshControl();
  const insets = useSafeAreaInsets();

  const nameData: TyphoonName | RetiredName | null = detail?.name ?? null;
  const storms: Storm[] = detail?.storms ?? [];
  const isInPosition = nameData ? !isExternalPosition(nameData.position) : false;
  const displayName = nameData?.name ?? name;
  const isRetired = nameData?.isRetired ?? false;

  const titleColor = nameData
    ? getNameStatusColor({ ...nameData, isExternal: !isInPosition })
    : COLOR.textSecondary;

  const correctSpelling = storms[0]?.correctSpelling;
  const metaCountry = nameData?.country ?? storms[0]?.country;
  const metaPosition = nameData?.position ?? storms[0]?.position;

  const header = (
    <View style={styles.header}>
      <View style={styles.heading}>
        <NameStatusIcon
          isRetired={isRetired}
          retirementReason={nameData?.retirementReason}
          position={isInPosition ? nameData?.position : 0}
          size={26}
        />
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {displayName.toLowerCase()}
        </Text>
      </View>

      <View style={styles.meta}>
        {metaCountry ? (
          isInPosition ? (
            <CountryFlag country={metaCountry} size={18} showName />
          ) : (
            <Text style={styles.metaText}>{metaCountry}</Text>
          )
        ) : null}
        {isInPosition && metaPosition != null && (
          <Text style={styles.metaPosition}>#{metaPosition}</Text>
        )}
        <StatusBadge
          isInPosition={isInPosition}
          isRetired={isRetired}
          retirementReason={nameData?.retirementReason}
        />
      </View>

      {isInPosition && nameData && (
        <Section title="Name Details">
          {/* The page header already carries the status badge. */}
          <NameDetailsContent name={nameData} correctSpelling={correctSpelling} hideStatus />
        </Section>
      )}

      <Text style={styles.listTitle}>All Storms ({storms.length})</Text>

      {storms.length > 0 && <StormStats storms={storms} />}
    </View>
  );

  return (
    <View style={styles.root}>
      {staleError && <StaleBanner />}

      <FlatList
        data={storms}
        keyExtractor={(storm, index) => `${storm.name}-${storm.year}-${index}`}
        // One card per row: a track map at half a phone's width is unreadable.
        renderItem={({ item }) => <StormCard storm={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={styles.empty}>No storms found for this name.</Text>}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACE.xl }]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        // Each card carries a remote track map, so mounting the whole history at once is what the
        // ScrollView this replaced got wrong.
        initialNumToRender={4}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: SPACE.lg,
    gap: SPACE.lg,
  },
  header: {
    gap: SPACE.lg,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm + 2,
  },
  title: {
    flexShrink: 1,
    fontFamily: "OpenSans_700Bold",
    fontSize: 28,
    textTransform: "capitalize",
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: SPACE.sm + 2,
  },
  metaText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textSecondary,
  },
  metaPosition: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    color: COLOR.textBody,
  },
  badge: {
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    borderRadius: RADIUS.pill,
  },
  badgeLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
  },
  listTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.textSecondary,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
    textAlign: "center",
    paddingVertical: SPACE.md,
  },
});
