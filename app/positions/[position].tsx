import { useApiQuery } from "@/lib/api/client";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import HeaderPager from "@/lib/components/common/HeaderPager";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import SwipePager from "@/lib/components/common/SwipePager";
import PositionPageContent from "@/lib/components/position/PositionPageContent";
import type { PositionDetail } from "@/lib/types";
import {
  getPositionFromSlug,
  getPositionSlug,
  getPositionTitle,
  isKnownPosition,
  stepPosition,
} from "@/lib/utils/position";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export default function PositionScreen() {
  const { position: slug = "" } = useLocalSearchParams<{ position: string }>();
  const router = useRouter();

  const position = getPositionFromSlug(slug);
  const isKnown = isKnownPosition(position);

  const { data, isLoading, isError, isNotFound, isRefetching, refetch } =
    useApiQuery<PositionDetail>(isKnown ? `/api/v1/position-detail?position=${position}` : null);

  const refreshValue = useMemo(
    () => ({ refreshing: isRefetching, onRefresh: refetch }),
    [isRefetching, refetch],
  );

  // replace, not push: paging through positions should not build a back stack to unwind.
  const go = (target: number) => router.replace(`/positions/${getPositionSlug(target)}`);

  const prevPosition = isKnown ? stepPosition(position, -1) : 1;
  const nextPosition = isKnown ? stepPosition(position, 1) : 1;

  return (
    <>
      <Stack.Screen
        options={{
          title: isKnown ? getPositionTitle(position) : "Position",
          headerRight: isKnown
            ? () => (
                <HeaderPager
                  onPrev={() => go(prevPosition)}
                  onNext={() => go(nextPosition)}
                  prevLabel={`Previous position, ${getPositionTitle(prevPosition)}`}
                  nextLabel={`Next position, ${getPositionTitle(nextPosition)}`}
                />
              )
            : undefined,
        }}
      />

      <SwipePager enabled={isKnown} onPrev={() => go(prevPosition)} onNext={() => go(nextPosition)}>
        {!isKnown || isNotFound ? (
          <View style={styles.state}>
            <EmptyResults
              icon="help-circle-outline"
              description={`There is no naming position "${slug}".`}
            />
          </View>
        ) : isLoading ? (
          <ScreenLoading />
        ) : isError && !data ? (
          <FrownError onRetry={refetch} />
        ) : (
          <RefreshProvider value={refreshValue}>
            <PositionPageContent detail={data} position={position} staleError={isError} />
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
