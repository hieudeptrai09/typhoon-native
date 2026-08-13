import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import ScreenScroll from "@/lib/components/common/ScreenScroll";
import NamesGrid from "@/lib/components/dashboard/grids/NamesGrid";
import StormsGrid from "@/lib/components/dashboard/grids/StormsGrid";
import SpecialButtons from "@/lib/components/dashboard/widgets/SpecialButtons";
import SpecialNamesList from "@/lib/components/dashboard/widgets/SpecialNamesList";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { DashboardParams, Storm } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  getGroupedStorms,
  getIntensityFromNumber,
} from "@/lib/utils/storm/aggregate";
import type { SortField } from "@/lib/utils/table";
import { StyleSheet, View } from "react-native";

interface StormsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  averageValues: Record<number, number> | null;
  onCellClick: (data: number | string, key: string) => void;
}

interface NameData {
  name: string;
  country: string;
  position: number;
  count: number;
  avgIntensity: number;
  year: number;
}

const sortFields: SortField<NameData>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  { key: "position", label: "Position", compare: (a, b) => a.position - b.position },
  { key: "count", label: "Storm count", compare: (a, b) => a.count - b.count },
  { key: "year", label: "Last year", compare: (a, b) => a.year - b.year },
];

const StormsView = ({ params, stormsData, averageValues, onCellClick }: StormsViewProps) => {
  const filter = params.filter || "position";

  if (filter === "position") {
    return (
      <ScreenScroll>
        <StormsGrid onCellClick={onCellClick} stormsData={stormsData} isClickable />
        <SpecialButtons
          onCellClick={onCellClick}
          isAverageView={false}
          averageValues={averageValues}
        />
      </ScreenScroll>
    );
  }

  // name + table → names pager with the out-of-grid names listed under it. The pager scrolls its
  // own pages, so this branch must not use ScreenScroll.
  if (params.mode === "table") {
    return (
      <View style={styles.stack}>
        <NamesGrid stormsData={stormsData} onCellClick={onCellClick} />
        <SpecialNamesList
          stormsData={stormsData}
          onNameClick={(name) => onCellClick(name, "name")}
        />
      </View>
    );
  }

  const nameGroups = getGroupedStorms(stormsData, "name");
  const nameData: NameData[] = Object.entries(nameGroups).map(([name, storms]) => ({
    name,
    country: storms[0].country,
    position: storms[0].position,
    count: storms.length,
    avgIntensity: calculateAverage(storms),
    year: storms[storms.length - 1].year,
  }));

  return (
    <DataList<NameData>
      data={nameData}
      keyExtractor={(row) => row.name}
      sortFields={sortFields}
      countLabel={(count) => `${count} name${count === 1 ? "" : "s"}`}
      onRowPress={(row) => onCellClick(row.name, "name")}
      renderCard={(row, index) => {
        const color = TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(row.avgIntensity)];
        return (
          <DataCard
            ordinal={index + 1}
            title={row.name}
            titleColor={color}
            accentColor={color}
            trailing={`×${row.count}`}
            fields={[
              { label: "Position", value: getPositionTitle(row.position) },
              { label: "Last year", value: String(row.year) },
              {
                label: "Contributed by",
                value: <CountryFlag country={row.country} size={16} showName />,
                wide: true,
              },
            ]}
            pressable
          />
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    gap: 16,
  },
});

export default StormsView;
