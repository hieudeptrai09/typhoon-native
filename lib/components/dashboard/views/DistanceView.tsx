import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import ScreenScroll from "@/lib/components/common/ScreenScroll";
import DistanceGrid from "@/lib/components/dashboard/grids/DistanceGrid";
import DistanceNameGrid from "@/lib/components/dashboard/views/DistanceNameGrid";
import SpecialButtons from "@/lib/components/dashboard/widgets/SpecialButtons";
import type { DashboardParams, Storm } from "@/lib/types";
import { getDistanceColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import { calculateDistances, formatDistance, getGroupedStorms } from "@/lib/utils/storm/aggregate";
import type { SortField } from "@/lib/utils/table";
import { useMemo } from "react";

interface DistanceViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

interface DistanceRow {
  position: number;
  name?: string;
  country: string;
  count: number;
  distanceNumber: number;
  distance: string;
}

const positionField: SortField<DistanceRow> = {
  key: "position",
  label: "Position",
  compare: (a, b) => a.position - b.position,
};

const countryField: SortField<DistanceRow> = {
  key: "country",
  label: "Contributed by",
  compare: (a, b) => a.country.localeCompare(b.country),
};

const countField: SortField<DistanceRow> = {
  key: "count",
  label: "Storm count",
  compare: (a, b) => a.count - b.count,
};

const distanceField: SortField<DistanceRow> = {
  key: "distance",
  label: "Avg recurrence",
  compare: (a, b) => a.distanceNumber - b.distanceNumber,
};

const nameField: SortField<DistanceRow> = {
  key: "name",
  label: "Name",
  compare: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
};

const makeSortFields = (filterType: "position" | "name"): SortField<DistanceRow>[] =>
  filterType === "name"
    ? [nameField, countryField, positionField, countField, distanceField]
    : [positionField, countryField, countField, distanceField];

const buildRows = (
  filterType: "position" | "name",
  distanceMap: Record<string, number>,
  groupedStorms: Record<string, Storm[]>,
): DistanceRow[] =>
  Object.entries(distanceMap).map(([key, dist]) => {
    const storms = groupedStorms[key] || [];
    const base = {
      country: storms[0]?.country ?? "",
      count: storms.length,
      distanceNumber: dist,
      distance: formatDistance(dist),
    };
    return filterType === "name"
      ? { name: key, position: storms[0]?.position ?? 0, ...base }
      : { position: parseInt(key), ...base };
  });

const DistanceView = ({ params, stormsData, onCellClick }: DistanceViewProps) => {
  const filterType = (params.filter || "position") as "position" | "name";

  const distanceMap = useMemo(
    () => calculateDistances(stormsData, filterType),
    [stormsData, filterType],
  );

  const groupedStorms = useMemo(
    () => getGroupedStorms(stormsData, filterType),
    [stormsData, filterType],
  );

  const distanceValuesForGrid = useMemo<Record<number, number>>(() => {
    if (filterType !== "position") return {};
    const result: Record<number, number> = {};
    Object.entries(distanceMap).forEach(([key, value]) => {
      result[Number(key)] = value;
    });
    return result;
  }, [distanceMap, filterType]);

  const sortFields = useMemo(() => makeSortFields(filterType), [filterType]);

  if (params.mode === "table" && filterType === "name") {
    return <DistanceNameGrid stormsData={stormsData} onCellClick={onCellClick} />;
  }

  if (params.mode === "table" && filterType === "position") {
    return (
      <ScreenScroll>
        <DistanceGrid
          onCellClick={onCellClick}
          stormsData={stormsData}
          distanceValues={distanceValuesForGrid}
          isClickable
        />
        <SpecialButtons
          onCellClick={onCellClick}
          isAverageView={false}
          averageValues={null}
          distanceValues={distanceValuesForGrid}
        />
      </ScreenScroll>
    );
  }

  const data = buildRows(filterType, distanceMap, groupedStorms);

  return (
    <DataList<DistanceRow>
      data={data}
      keyExtractor={(row) => (filterType === "name" ? (row.name ?? "") : String(row.position))}
      sortFields={sortFields}
      sortKey={`recurrence/${filterType}`}
      onRowPress={(row) =>
        filterType === "name"
          ? onCellClick(row.name ?? "", "name")
          : onCellClick(row.position, "position")
      }
      renderCard={(row, index) => (
        <DataCard
          ordinal={index + 1}
          title={filterType === "name" ? (row.name ?? "") : getPositionTitle(row.position)}
          accentColor={getDistanceColor(row.distanceNumber)}
          fields={[
            { label: "Avg recurrence", value: row.distance },
            ...(filterType === "name"
              ? [{ label: "Position", value: getPositionTitle(row.position) }]
              : []),
            { label: "Storm count", value: String(row.count) },
            {
              label: "Contributed by",
              value: <CountryFlag country={row.country} size={16} showName />,
            },
          ]}
          pressable
        />
      )}
    />
  );
};

export default DistanceView;
