import { useQuery } from "@/lib/api/client";
import FrownError from "@/lib/components/common/FrownError";
import IndexTile from "@/lib/components/common/IndexTile";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import StaleBanner from "@/lib/components/common/StaleBanner";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { getStorms } from "@/lib/data/getStorms";
import { getGroupCounts, getSeasonYears } from "@/lib/utils/storm/aggregate";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DecadeSection {
  decade: number;
  // One row holding the whole decade: the tiles wrap two to a row inside it.
  data: number[][];
}

export default function SeasonsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, isRefetching, refetch } = useQuery("storms", () => getStorms());

  const counts = useMemo(() => getGroupCounts(data ?? [], "year"), [data]);

  // Newest decade and season first: recent seasons are the ones people come to compare.
  const sections = useMemo<DecadeSection[]>(() => {
    const decades = new Map<number, number[]>();
    [...getSeasonYears(data ?? [])].reverse().forEach((year) => {
      const decade = Math.floor(year / 10) * 10;
      decades.set(decade, [...(decades.get(decade) ?? []), year]);
    });
    return [...decades.entries()].map(([decade, years]) => ({ decade, data: [years] }));
  }, [data]);

  if (isLoading) return <ScreenLoading />;
  if (isError && !data) return <FrownError onRetry={refetch} />;

  return (
    <View style={styles.root}>
      {isError && <StaleBanner />}

      <SectionList<number[], DecadeSection>
        sections={sections}
        keyExtractor={(years) => String(years[0])}
        renderSectionHeader={({ section }) => (
          <View style={styles.headerWrap}>
            <Text style={styles.header} accessibilityRole="header">
              {section.decade}s
            </Text>
          </View>
        )}
        renderItem={({ item: years }) => (
          <View style={styles.grid}>
            {years.map((year) => (
              <View key={year} style={styles.cell}>
                <IndexTile
                  label={String(year)}
                  count={counts[year] ?? 0}
                  onPress={() => router.push(`/years/${year}`)}
                />
              </View>
            ))}
            {/* Keeps a decade's odd last season at half width instead of stretching across. */}
            {years.length % 2 === 1 && <View style={styles.cell} />}
          </View>
        )}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACE.xl }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLOR.accent]}
            tintColor={COLOR.accent}
          />
        }
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACE.lg,
  },
  // Opaque, so tiles scrolling under the pinned decade stay hidden.
  headerWrap: {
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.sm,
    backgroundColor: COLOR.background,
  },
  header: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.textSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.sm,
  },
  cell: {
    // Half the row minus the gap, so two seasons sit side by side.
    flexBasis: "48%",
    flexGrow: 1,
  },
});
