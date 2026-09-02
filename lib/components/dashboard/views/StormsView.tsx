import ScreenScroll from "@/lib/components/common/ScreenScroll";
import NamesGrid from "@/lib/components/dashboard/grids/NamesGrid";
import StormsGrid from "@/lib/components/dashboard/grids/StormsGrid";
import NameRowsList from "@/lib/components/dashboard/views/NameRowsList";
import SpecialButtons from "@/lib/components/dashboard/widgets/SpecialButtons";
import SpecialNamesList from "@/lib/components/dashboard/widgets/SpecialNamesList";
import type { DashboardParams, Storm } from "@/lib/types";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

interface StormsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  onSelectPosition: (position: number) => void;
}

const openName = (name: string) => router.push(`/info/${encodeURIComponent(name)}`);

const StormsView = ({ params, stormsData, onSelectPosition }: StormsViewProps) => {
  if (params.mode === "list") {
    return <NameRowsList storms={stormsData} />;
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
