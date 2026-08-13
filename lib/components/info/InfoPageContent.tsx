import CountryFlag from "@/lib/components/common/CountryFlag";
import FrownError from "@/lib/components/common/FrownError";
import NameDetailsContent from "@/lib/components/name/NameDetailsContent";
import NameStatusIcon from "@/lib/components/name/NameStatusIcon";
import StormCard from "@/lib/components/storm/StormCard";
import StormStats from "@/lib/components/storm/StormStats";
import { COLOR } from "@/lib/constants/theme";
import type { RetiredName, RetirementReason, SearchDetail, Storm, TyphoonName } from "@/lib/types";
import { getNameStatusBgColor, getNameStatusColor } from "@/lib/utils/colors";
import { isExternalPosition } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface InfoPageContentProps {
  detail: SearchDetail | null;
  name: string;
  isError?: boolean;
  allNames?: string[];
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoPagination({ names, currentIndex }: { names: string[]; currentIndex: number }) {
  const router = useRouter();

  if (names.length === 0 || currentIndex === -1) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === names.length - 1;
  const prevName = names[isFirst ? names.length - 1 : currentIndex - 1];
  const nextName = names[isLast ? 0 : currentIndex + 1];

  // replace, not push: paging through names should not build a back stack to unwind.
  const go = (target: string) => router.replace(`/info/${target.toLowerCase()}`);

  return (
    <View style={styles.pagination} accessibilityLabel="Name pagination">
      <Pressable
        onPress={() => go(prevName)}
        style={({ pressed }) => [styles.pageButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Previous name, ${prevName}`}
      >
        <Ionicons name="chevron-back" size={16} color={COLOR.textInverse} />
        <Text style={styles.pageLabel} numberOfLines={1}>
          {prevName.toLowerCase()}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => go(nextName)}
        style={({ pressed }) => [styles.pageButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Next name, ${nextName}`}
      >
        <Text style={styles.pageLabel} numberOfLines={1}>
          {nextName.toLowerCase()}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLOR.textInverse} />
      </Pressable>
    </View>
  );
}

export default function InfoPageContent({
  detail,
  name,
  isError = false,
  allNames = [],
}: InfoPageContentProps) {
  if (isError) {
    return <FrownError />;
  }

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
  const currentIndex = allNames.findIndex((n) => n.toLowerCase() === displayName.toLowerCase());

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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

      <Section title={`All Storms (${storms.length})`}>
        {storms.length === 0 ? (
          <Text style={styles.empty}>No storms found for this name.</Text>
        ) : (
          <View style={styles.storms}>
            <StormStats storms={storms} />
            {/* One card per row: a track map at half a phone's width is unreadable. */}
            {storms.map((storm, index) => (
              <StormCard key={index} storm={storm} />
            ))}
          </View>
        )}
      </Section>

      <InfoPagination names={allNames} currentIndex={currentIndex} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    gap: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
  },
  section: {
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
  },
  sectionTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.textSecondary,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
    textAlign: "center",
    paddingVertical: 12,
  },
  storms: {
    gap: 16,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.borderStrong,
  },
  pageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLOR.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  pageLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.textInverse,
    textTransform: "capitalize",
  },
});
