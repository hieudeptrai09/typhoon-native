import { useQuery } from "@/lib/api/client";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import HeaderPager from "@/lib/components/common/HeaderPager";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import SwipePager from "@/lib/components/common/SwipePager";
import CountryPageContent from "@/lib/components/country/CountryPageContent";
import { getStorms } from "@/lib/data/getStorms";
import {
  getCountryFromSlug,
  getCountrySlug,
  getCountryStorms,
  stepCountry,
} from "@/lib/utils/country";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export default function CountryScreen() {
  const { country: slug = "" } = useLocalSearchParams<{ country: string }>();
  const router = useRouter();

  const country = getCountryFromSlug(slug);

  // Same key as the Storms tab, so a country opened from anywhere reuses the record already loaded.
  const { data, isLoading, isError, isRefetching, refetch } = useQuery(
    country ? "storms" : null,
    () => getStorms(),
  );

  const storms = useMemo(
    () => (data && country ? getCountryStorms(data, country) : []),
    [data, country],
  );

  const refreshValue = useMemo(
    () => ({ refreshing: isRefetching, onRefresh: refetch }),
    [isRefetching, refetch],
  );

  // replace, not push: paging through countries should not build a back stack to unwind.
  const go = (target: string) => router.replace(`/countries/${getCountrySlug(target)}`);

  const prevCountry = country ? stepCountry(country, -1) : "";
  const nextCountry = country ? stepCountry(country, 1) : "";

  return (
    <>
      <Stack.Screen
        options={{
          title: country ?? "Country",
          headerRight: country
            ? () => (
                <HeaderPager
                  onPrev={() => go(prevCountry)}
                  onNext={() => go(nextCountry)}
                  prevLabel={`Previous country, ${prevCountry}`}
                  nextLabel={`Next country, ${nextCountry}`}
                />
              )
            : undefined,
        }}
      />

      <SwipePager
        enabled={country !== null}
        onPrev={() => go(prevCountry)}
        onNext={() => go(nextCountry)}
      >
        {!country ? (
          <View style={styles.state}>
            <EmptyResults
              icon="flag-outline"
              description={`No Typhoon Committee member matches "${slug}".`}
            />
          </View>
        ) : isLoading ? (
          <ScreenLoading />
        ) : isError && !data ? (
          <FrownError onRetry={refetch} />
        ) : (
          <RefreshProvider value={refreshValue}>
            <CountryPageContent country={country} storms={storms} staleError={isError} />
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
