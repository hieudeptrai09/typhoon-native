import CountryFlag from "@/lib/components/CountryFlag";
import DefTable from "@/lib/components/DefTable";
import type { DashboardParams, Storm } from "@/lib/types";
import { clickableRowProps } from "@/lib/utils/a11y";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import { calculateAverage, getGroupedStorms, getIntensityFromNumber } from "@/lib/utils/storms";
import type { ColumnsType } from "antd/es/table";
import NamesGrid from "../_grids/NamesGrid";
import StormsGrid from "../_grids/StormsGrid";
import SpecialButtons from "../_widgets/SpecialButtons";
import SpecialNamesListDiv from "../_widgets/SpecialNamesListDiv";

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

const makeNameColumns = (): ColumnsType<NameData> => [
  {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: NameData, index: number) => (
      <span className="text-sm font-semibold text-sky-700">{index + 1}</span>
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: 100,
    fixed: "left" as const,
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (_: unknown, row: NameData) => {
      const intensityLabel = getIntensityFromNumber(row.avgIntensity);
      const textColor = TEXT_COLOR_WHITE_BACKGROUND[intensityLabel];
      return (
        <span className="font-semibold" style={{ color: textColor }}>
          {row.name}
        </span>
      );
    },
  },
  {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => a.country.localeCompare(b.country),
    render: (_: unknown, row: NameData) => <CountryFlag country={row.country} />,
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
    sorter: (a, b) => a.position - b.position,
    render: (_: unknown, row: NameData) => <span>{getPositionTitle(row.position)}</span>,
  },
  {
    title: "Storm Count",
    dataIndex: "count",
    key: "count",
    sorter: (a, b) => a.count - b.count,
  },
  {
    title: "Last Year",
    dataIndex: "year",
    key: "year",
    sorter: (a, b) => a.year - b.year,
  },
];

const StormsView = ({ params, stormsData, averageValues, onCellClick }: StormsViewProps) => {
  const filter = params.filter || "position";

  if (filter === "position") {
    return (
      <div className="flex flex-col gap-6">
        <StormsGrid onCellClick={onCellClick} stormsData={stormsData} isClickable />
        <SpecialButtons
          onCellClick={onCellClick}
          isAverageView={false}
          averageValues={averageValues}
        />
      </div>
    );
  }

  // name + table → names grid with special names list above
  if (params.mode === "table") {
    return (
      <div className="flex flex-col gap-6">
        <NamesGrid stormsData={stormsData} onCellClick={onCellClick} />
        <SpecialNamesListDiv
          stormsData={stormsData}
          onNameClick={(name) => onCellClick(name, "name")}
        />
      </div>
    );
  }

  // name + list
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
    <DefTable<NameData>
      maxWidth="max-w-2xl"
      dataSource={nameData}
      columns={makeNameColumns()}
      rowKey="name"
      onRow={(row) =>
        clickableRowProps(`View details for ${row.name}`, () => onCellClick(row.name, "name"))
      }
    />
  );
};

export default StormsView;
