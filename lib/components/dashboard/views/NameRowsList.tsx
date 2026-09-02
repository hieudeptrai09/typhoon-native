import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  getGroupedStorms,
  getIntensityFromNumber,
} from "@/lib/utils/storm/aggregate";
import type { SortField } from "@/lib/utils/table";
import { router } from "expo-router";
import { useMemo } from "react";

interface NameRow {
  name: string;
  country: string;
  position: number;
  count: number;
  avgIntensity: number;
  lastYear: number;
}

const SORT_FIELDS: SortField<NameRow>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  { key: "position", label: "Position", compare: (a, b) => a.position - b.position },
  { key: "count", label: "Storm count", compare: (a, b) => a.count - b.count },
  { key: "year", label: "Last year", compare: (a, b) => a.lastYear - b.lastYear },
];

const DEFAULT_SORT = [{ key: "name", order: "ascend" as const }];

const toRows = (storms: Storm[]): NameRow[] =>
  Object.entries(getGroupedStorms(storms, "name")).map(([name, group]) => ({
    name,
    country: group[0].country,
    position: group[0].position,
    count: group.length,
    avgIntensity: calculateAverage(group),
    lastYear: Math.max(...group.map((storm) => storm.year)),
  }));

const NameRowsList = ({ storms }: { storms: Storm[] }) => {
  const data = useMemo(() => toRows(storms), [storms]);

  return (
    <DataList<NameRow>
      data={data}
      keyExtractor={(row) => row.name}
      sortFields={SORT_FIELDS}
      sortKey="all/names"
      defaultSort={DEFAULT_SORT}
      countLabel={(count) => `${count} name${count === 1 ? "" : "s"}`}
      onRowPress={(row) => router.push(`/info/${encodeURIComponent(row.name)}`)}
      renderCard={(row, index) => {
        const intensity = getIntensityFromNumber(row.avgIntensity);
        return (
          <DataCard
            ordinal={index + 1}
            title={row.name}
            titleColor={TEXT_COLOR_WHITE_BACKGROUND[intensity]}
            fields={[
              { label: "Storm count", value: String(row.count) },
              { label: "Last year", value: String(row.lastYear) },
              { label: "Position", value: getPositionTitle(row.position) },
              {
                label: "Contributed by",
                value: <CountryFlag country={row.country} size={16} showName />,
              },
            ]}
            pressable
          />
        );
      }}
    />
  );
};

export default NameRowsList;
