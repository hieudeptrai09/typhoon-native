import { useApiQuery } from "@/lib/api/client";
import { SortMemoryProvider } from "@/lib/components/common/DataList/sortMemory";
import FrownError from "@/lib/components/common/FrownError";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import StaleBanner from "@/lib/components/common/StaleBanner";
import SeasonMonthsModal from "@/lib/components/season/SeasonMonthsModal";
import SeasonToDateList from "@/lib/components/season/SeasonToDateList";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { formatMonthDay, monthDayOf, todayISO } from "@/lib/utils/date";
import { getSeasonToDate, NAMING_LIST_FIRST_YEAR, type SeasonToDateRow } from "@/lib/utils/storm/calendar";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * How the running season compares with every season before it, measured at today. The date is
 * fixed to today on purpose: "am I ahead of a normal year" is a question about now, and the
 * calendar tab already owns picking an arbitrary day.
 */
export default function SeasonScreen() {
  const [monthDay] = useState(() => monthDayOf(todayISO()));
  const [openSeason, setOpenSeason] = useState<SeasonToDateRow | null>(null);

  const { data, isLoading, isError, isRefetching, refetch } =
    useApiQuery<Storm[]>("/api/v1/storms");

  const refreshValue = useMemo(
    () => ({ refreshing: isRefetching, onRefresh: refetch }),
    [isRefetching, refetch],
  );

  const rows = useMemo(() => (data ? getSeasonToDate(data, monthDay) : []), [data, monthDay]);

  if (isLoading) return <ScreenLoading />;
  if (!data) return <FrownError onRetry={refetch} />;

  return (
    <>
      <Stack.Screen options={{ title: "Season pace" }} />

      <RefreshProvider value={refreshValue}>
        <SortMemoryProvider>
          <View style={styles.root}>
            {isError && <StaleBanner />}

            <Text style={styles.summary}>
              Storms JMA numbered, by season since {NAMING_LIST_FIRST_YEAR}, counted up to{" "}
              {formatMonthDay(monthDay)}. Open a season for its months.
            </Text>

            <SeasonToDateList rows={rows} onSeasonPress={setOpenSeason} />

            <SeasonMonthsModal
              isOpen={openSeason !== null}
              onClose={() => setOpenSeason(null)}
              row={openSeason}
              monthDay={monthDay}
            />
          </View>
        </SortMemoryProvider>
      </RefreshProvider>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  summary: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: COLOR.textMuted,
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.sm,
  },
});
