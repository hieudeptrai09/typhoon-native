import { useQuery } from "@/lib/api/client";
import { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import FrownError from "@/lib/components/common/FrownError";
import IndexTile from "@/lib/components/common/IndexTile";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import ScreenScroll from "@/lib/components/common/ScreenScroll";
import StaleBanner from "@/lib/components/common/StaleBanner";
import PositionGrid, { type GridCell } from "@/lib/components/position/PositionGrid";
import { GRID_COLS, SPECIAL_POSITIONS } from "@/lib/constants/position";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { getStorms } from "@/lib/data/getStorms";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import { getGroupSummaries } from "@/lib/utils/storm/aggregate";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PositionsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, isRefetching, refetch } = useQuery("storms", () => getStorms());

  const summaries = useMemo(() => getGroupSummaries(data ?? [], "position"), [data]);

  const refreshValue = useMemo(
    () => ({ refreshing: isRefetching, onRefresh: refetch }),
    [isRefetching, refetch],
  );

  const open = useCallback(
    (position: number) => router.push(`/positions/${getPositionSlug(position)}`),
    [router],
  );

  // Stable per summaries, or the grid's 140 memoised cells would all re-render on every tap.
  const renderCell = useCallback(
    (position: number): GridCell => {
      const hasStorms = summaries[position] !== undefined;

      return {
        color: hasStorms ? COLOR.surface : COLOR.surfaceSunken,
        clickable: true,
        label: getPositionTitle(position),
        labelColor: hasStorms ? COLOR.textSecondary : COLOR.textFaint,
      };
    },
    [summaries],
  );

  const renderReadout = useCallback(
    (position: number) => {
      const summary = summaries[position];

      return (
        <View style={styles.readout}>
          <Text style={styles.readoutTitle}>
            {getPositionTitle(position)}
            <Text style={styles.readoutCountry}>
              {"  "}
              {COUNTRY_NAMES[(position - 1) % GRID_COLS]}
            </Text>
          </Text>
          <Text style={styles.readoutStats}>
            {summary
              ? `${summary.count} ${summary.count === 1 ? "storm" : "storms"}`
              : "No storms yet"}
          </Text>
        </View>
      );
    },
    [summaries],
  );

  if (isLoading) return <ScreenLoading />;
  if (isError && !data) return <FrownError onRetry={refetch} />;

  return (
    <RefreshProvider value={refreshValue}>
      <View style={styles.root}>
        {isError && <StaleBanner />}

        <ScreenScroll>
          <Text style={styles.intro}>
            Each cell is one slot of the naming table, labelled by its row and country column. Tap a
            cell to see how many storms it has carried, then open it.
          </Text>

          <PositionGrid
            renderCell={renderCell}
            renderReadout={renderReadout}
            onPositionPress={open}
          />

          <View style={styles.basins}>
            <Text style={styles.basinsTitle} accessibilityRole="header">
              Neighbouring basins
            </Text>
            {SPECIAL_POSITIONS.map(({ id, label }) => (
              <IndexTile
                key={id}
                label={label}
                count={summaries[id]?.count ?? 0}
                onPress={() => open(id)}
              />
            ))}
          </View>
        </ScreenScroll>
      </View>
    </RefreshProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  intro: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: COLOR.textBody,
  },
  readout: {
    gap: 2,
  },
  readoutTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 16,
    color: COLOR.text,
  },
  readoutCountry: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  readoutStats: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textBody,
    fontVariant: ["tabular-nums"],
  },
  basins: {
    gap: SPACE.sm,
  },
  basinsTitle: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    color: COLOR.textSecondary,
  },
});
