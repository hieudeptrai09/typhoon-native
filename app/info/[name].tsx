import { useApiQuery } from "@/lib/api/client";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import HeaderPager from "@/lib/components/common/HeaderPager";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import InfoPageContent from "@/lib/components/info/InfoPageContent";
import DidYouMean from "@/lib/components/search/DidYouMean";
import type { SearchDetail } from "@/lib/types";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export default function InfoScreen() {
  // Expo Router hands the segment back already decoded, so no decodeURIComponent here.
  const { name = "" } = useLocalSearchParams<{ name: string }>();
  const query = encodeURIComponent(name);
  const router = useRouter();

  const detail = useApiQuery<SearchDetail>(name ? `/api/v1/name-detail?name=${query}` : null);
  const nameList = useApiQuery<string[]>("/api/v1/name-list");

  // A misspelling gets trigram suggestions instead of a dead end, but only once we know it missed.
  const similar = useApiQuery<string[]>(
    detail.isNotFound ? `/api/v1/similar-names?name=${query}` : null,
  );

  const allNames = useMemo(
    () =>
      [...(nameList.data ?? [])].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    [nameList.data],
  );

  const refetchDetail = detail.refetch;
  const refetchNameList = nameList.refetch;
  const refreshValue = useMemo(
    () => ({
      refreshing: detail.isRefetching,
      onRefresh: () => {
        refetchDetail();
        refetchNameList();
      },
    }),
    [detail.isRefetching, refetchDetail, refetchNameList],
  );

  const index = allNames.findIndex((entry) => entry.toLowerCase() === name.toLowerCase());
  const hasPager = allNames.length > 1 && index !== -1;
  const prevName = hasPager ? allNames[(index - 1 + allNames.length) % allNames.length] : "";
  const nextName = hasPager ? allNames[(index + 1) % allNames.length] : "";

  // replace, not push: paging through names should not build a back stack to unwind.
  const go = (target: string) => router.replace(`/info/${target.toLowerCase()}`);

  const displayName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  return (
    <>
      <Stack.Screen
        options={{
          title: displayName || "Name",
          headerRight: hasPager
            ? () => (
                <HeaderPager
                  onPrev={() => go(prevName)}
                  onNext={() => go(nextName)}
                  prevLabel={`Previous name, ${prevName}`}
                  nextLabel={`Next name, ${nextName}`}
                />
              )
            : undefined,
        }}
      />

      {detail.isLoading ? (
        <ScreenLoading />
      ) : detail.isNotFound ? (
        <View style={styles.state}>
          <EmptyResults
            icon="search-outline"
            description={`No typhoon name matches "${name}".`}
            // Suggestions are a nicety, so a failed lookup degrades to the plain empty state.
            action={<DidYouMean names={similar.data ?? []} />}
          />
        </View>
      ) : detail.isError && !detail.data ? (
        <FrownError onRetry={detail.refetch} />
      ) : (
        <RefreshProvider value={refreshValue}>
          <InfoPageContent detail={detail.data} name={name} staleError={detail.isError} />
        </RefreshProvider>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    justifyContent: "center",
  },
});
