import { useApiQuery } from "@/lib/api/client";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import HeaderPager from "@/lib/components/common/HeaderPager";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import SwipePager from "@/lib/components/common/SwipePager";
import InfoPageContent from "@/lib/components/info/InfoPageContent";
import DidYouMean from "@/lib/components/search/DidYouMean";
import type { SearchDetail, SuggestionWithNameId } from "@/lib/types";
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

  const similar = useApiQuery<string[]>(
    detail.isNotFound ? `/api/v1/similar-names?name=${query}` : null,
  );

  // Only a retired name has proposed replacements, so the reference list stays unfetched
  // for every other name.
  const nameData = detail.data?.name;
  const suggestions = useApiQuery<SuggestionWithNameId[]>(
    nameData?.isRetired ? "/api/v1/suggestions" : null,
  );

  const nameSuggestions = useMemo(
    () => (suggestions.data ?? []).filter((suggestion) => suggestion.nameId === nameData?.id),
    [suggestions.data, nameData?.id],
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

      <SwipePager enabled={hasPager} onPrev={() => go(prevName)} onNext={() => go(nextName)}>
        {detail.isLoading ? (
          <ScreenLoading />
        ) : detail.isNotFound ? (
          <View style={styles.state}>
            <EmptyResults
              icon="search-outline"
              description={`No typhoon name matches "${name}".`}
              action={<DidYouMean names={similar.data ?? []} />}
            />
          </View>
        ) : detail.isError && !detail.data ? (
          <FrownError onRetry={detail.refetch} />
        ) : (
          <RefreshProvider value={refreshValue}>
            <InfoPageContent
              detail={detail.data}
              name={name}
              suggestions={nameSuggestions}
              staleError={detail.isError}
            />
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
