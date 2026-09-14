import { useQuery } from "@/lib/api/client";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import HeaderPager from "@/lib/components/common/HeaderPager";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import SwipePager from "@/lib/components/common/SwipePager";
import SeasonPageContent from "@/lib/components/season/SeasonPageContent";
import { getStorms } from "@/lib/data/getStorms";
import { getSeasonStorms, getSeasonYears } from "@/lib/utils/storm/aggregate";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export default function SeasonScreen() {
  const { year: raw = "" } = useLocalSearchParams<{ year: string }>();
  const router = useRouter();

  // Number("") is 0, so an empty segment needs its own rejection.
  const year = raw.trim() !== "" && Number.isInteger(Number(raw)) ? Number(raw) : null;

  const { data, isLoading, isError, isRefetching, refetch } = useQuery(
    year !== null ? "storms" : null,
    () => getStorms(),
  );

  const years = useMemo(() => getSeasonYears(data ?? []), [data]);
  const storms = useMemo(
    () => (data && year !== null ? getSeasonStorms(data, year) : []),
    [data, year],
  );

  const refreshValue = useMemo(
    () => ({ refreshing: isRefetching, onRefresh: refetch }),
    [isRefetching, refetch],
  );

  const index = year !== null ? years.indexOf(year) : -1;
  const hasPager = index !== -1 && years.length > 1;
  const prevYear = hasPager ? years[(index - 1 + years.length) % years.length] : 0;
  const nextYear = hasPager ? years[(index + 1) % years.length] : 0;

  // replace, not push: paging through seasons should not build a back stack to unwind.
  const go = (target: number) => router.replace(`/years/${target}`);

  const isUnknown = year === null || (data !== null && index === -1);

  return (
    <>
      <Stack.Screen
        options={{
          title: year !== null ? `${year} Season` : "Season",
          headerRight: hasPager
            ? () => (
                <HeaderPager
                  onPrev={() => go(prevYear)}
                  onNext={() => go(nextYear)}
                  prevLabel={`Previous season, ${prevYear}`}
                  nextLabel={`Next season, ${nextYear}`}
                />
              )
            : undefined,
        }}
      />

      <SwipePager enabled={hasPager} onPrev={() => go(prevYear)} onNext={() => go(nextYear)}>
        {isLoading ? (
          <ScreenLoading />
        ) : isError && !data ? (
          <FrownError onRetry={refetch} />
        ) : isUnknown || year === null ? (
          <View style={styles.state}>
            <EmptyResults
              icon="calendar-clear-outline"
              description={`There is no recorded typhoon season "${raw}".`}
            />
          </View>
        ) : (
          <RefreshProvider value={refreshValue}>
            <SeasonPageContent year={year} storms={storms} staleError={isError} />
          </RefreshProvider>
        )}
      </SwipePager>
    </>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    justifyContent: "center",
  },
});
