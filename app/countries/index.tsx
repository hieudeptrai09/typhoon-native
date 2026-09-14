import { useQuery } from "@/lib/api/client";
import CountryFlag, { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import FrownError from "@/lib/components/common/FrownError";
import IndexTile from "@/lib/components/common/IndexTile";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import StaleBanner from "@/lib/components/common/StaleBanner";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { getStorms } from "@/lib/data/getStorms";
import { getCountrySlug, getCountryStorms } from "@/lib/utils/country";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CountriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, isRefetching, refetch } = useQuery("storms", () => getStorms());

  const rows = useMemo(
    () =>
      COUNTRY_NAMES.map((country) => ({
        country,
        count: getCountryStorms(data ?? [], country).length,
      })),
    [data],
  );

  if (isLoading) return <ScreenLoading />;
  if (isError && !data) return <FrownError onRetry={refetch} />;

  return (
    <View style={styles.root}>
      {isError && <StaleBanner />}

      <FlatList
        data={rows}
        keyExtractor={(row) => row.country}
        renderItem={({ item }) => (
          <IndexTile
            label={item.country}
            count={item.count}
            icon={<CountryFlag country={item.country} size={26} />}
            onPress={() => router.push(`/countries/${getCountrySlug(item.country)}`)}
          />
        )}
        ListHeaderComponent={
          <Text style={styles.intro}>
            The 14 members of the Typhoon Committee, each contributing one column of names.
          </Text>
        }
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACE.xl }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLOR.accent]}
            tintColor={COLOR.accent}
          />
        }
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
    padding: SPACE.lg,
    gap: SPACE.sm,
  },
  intro: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: COLOR.textBody,
    marginBottom: SPACE.sm,
  },
});
