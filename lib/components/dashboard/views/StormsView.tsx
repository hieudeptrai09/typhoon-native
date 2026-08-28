import ScreenScroll from "@/lib/components/common/ScreenScroll";
import NamesGrid from "@/lib/components/dashboard/grids/NamesGrid";
import StormsGrid from "@/lib/components/dashboard/grids/StormsGrid";
import StormRowsList from "@/lib/components/dashboard/views/StormRowsList";
import SpecialButtons from "@/lib/components/dashboard/widgets/SpecialButtons";
import SpecialNamesList from "@/lib/components/dashboard/widgets/SpecialNamesList";
import type { DashboardParams, Storm } from "@/lib/types";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

interface StormsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  /** A cell opens the sheet rather than the position screen: the question is usually just which
   *  storms were here, and the sheet answers it without loading a screen. */
  onSelectPosition: (position: number) => void;
}

const openName = (name: string) => router.push(`/info/${encodeURIComponent(name)}`);

// The season a storm belongs to is the one thing every reader wants first, so the storm list opens
// on the newest rather than on whatever the alphabet happens to put at the top.
const NEWEST_FIRST = [{ key: "year", order: "descend" as const }];

/** Every storm in the table. Grouping shapes the grid; the list is the flat run of storms. */
const StormsView = ({ params, stormsData, onSelectPosition }: StormsViewProps) => {
  if (params.mode === "list") {
    return <StormRowsList storms={stormsData} sortKey="all/storms" defaultSort={NEWEST_FIRST} />;
  }

  if (params.filter === "name") {
    // The names pager scrolls its own pages, so this branch must not use ScreenScroll.
    return (
      <View style={styles.stack}>
        <NamesGrid stormsData={stormsData} onCellClick={(name) => openName(String(name))} />
        <SpecialNamesList stormsData={stormsData} onNameClick={openName} />
      </View>
    );
  }

  return (
    <ScreenScroll>
      <StormsGrid
        onCellClick={(position) => onSelectPosition(Number(position))}
        stormsData={stormsData}
        isClickable
      />
      <SpecialButtons onPress={onSelectPosition} />
    </ScreenScroll>
  );
};

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    gap: 16,
  },
});

export default StormsView;
