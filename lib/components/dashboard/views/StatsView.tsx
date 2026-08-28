import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard, type DataField } from "@/lib/components/common/DataList";
import ScreenScroll from "@/lib/components/common/ScreenScroll";
import NamesGrid from "@/lib/components/dashboard/grids/NamesGrid";
import StatGrid from "@/lib/components/dashboard/grids/StatGrid";
import SpecialButtons, {
  type SpecialValue,
} from "@/lib/components/dashboard/widgets/SpecialButtons";
import SpecialNamesList from "@/lib/components/dashboard/widgets/SpecialNamesList";
import { COLOR } from "@/lib/constants/theme";
import type { DashboardParams, Storm } from "@/lib/types";
import { getPositionTitle, isExternalPosition } from "@/lib/utils/position";
import { formatDuration } from "@/lib/utils/storm/dates";
import { buildStatRows, statColorsByKey, type StatRow } from "@/lib/utils/storm/stats";
import type { SortField } from "@/lib/utils/table";
import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  onSelectGroup: (row: StatRow) => void;
}

const VALUE_LABEL: Record<string, string> = {
  intensity: "Average intensity",
  recurrence: "Avg. recurrence",
  dates: "Avg. season",
};

const numericGroups = new Set(["position", "year", "month"]);

const makeSortFields = (metric: string, groupBy: string): SortField<StatRow>[] => {
  const groupField: SortField<StatRow> = {
    key: "group",
    label: groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
    compare: numericGroups.has(groupBy)
      ? (a, b) => Number(a.key) - Number(b.key)
      : (a, b) => a.key.localeCompare(b.key),
  };

  const fields: SortField<StatRow>[] = [groupField];

  if (groupBy === "name") {
    fields.push({
      key: "position",
      label: "Position",
      compare: (a, b) => (a.position ?? 0) - (b.position ?? 0),
    });
  }
  if (groupBy !== "country" && groupBy !== "year" && groupBy !== "month") {
    fields.push({
      key: "country",
      label: "Contributed by",
      compare: (a, b) => (a.country ?? "").localeCompare(b.country ?? ""),
    });
  }

  fields.push({ key: "count", label: "Storm count", compare: (a, b) => a.count - b.count });
  fields.push({
    key: "value",
    label: VALUE_LABEL[metric],
    compare: (a, b) => a.value - b.value,
  });

  if (metric === "dates") {
    fields.push({
      key: "end",
      label: "Avg. date end",
      compare: (a, b) => (a.endDoy ?? 0) - (b.endDoy ?? 0),
    });
    fields.push({
      key: "duration",
      label: "Avg. duration",
      compare: (a, b) => (a.duration ?? 0) - (b.duration ?? 0),
    });
  }

  return fields;
};

const titleOf = (row: StatRow, groupBy: string): ReactNode =>
  groupBy === "country" ? (
    <CountryFlag country={row.country ?? ""} size={20} showName />
  ) : (
    row.label
  );

const fieldsOf = (row: StatRow, metric: string, groupBy: string): DataField[] => {
  const fields: DataField[] = [
    {
      label: VALUE_LABEL[metric],
      value: <Text style={[styles.value, { color: row.color }]}>{row.display}</Text>,
    },
  ];

  if (metric === "dates") {
    fields.push({ label: "Avg. duration", value: formatDuration(row.duration ?? -1) });
  }

  fields.push({ label: "Storm count", value: String(row.count) });

  if (groupBy === "name" && row.position !== undefined) {
    fields.push({ label: "Position", value: getPositionTitle(row.position) });
  }
  if (groupBy !== "country" && groupBy !== "year" && groupBy !== "month" && row.country) {
    fields.push({
      label: "Contributed by",
      value: <CountryFlag country={row.country} size={16} showName />,
    });
  }

  return fields;
};

const StatsView = ({ params, stormsData, onSelectGroup }: StatsViewProps) => {
  const { metric, filter, mode } = params;

  const rows = useMemo(
    () => buildStatRows(stormsData, metric, filter),
    [stormsData, metric, filter],
  );

  const byKey = useMemo(() => new Map(rows.map((row) => [row.key, row])), [rows]);
  const sortFields = useMemo(() => makeSortFields(metric, filter), [metric, filter]);

  const select = (key: string) => {
    const row = byKey.get(key);
    if (row) onSelectGroup(row);
  };

  if (mode === "table" && filter === "name") {
    const nameColors = statColorsByKey(rows);
    // -1 marks "not measurable" for recurrence and dates only. An average intensity is genuinely
    // negative for a name that never got past a depression, and must still print.
    const nameSubtitles: Record<string, ReactNode> = Object.fromEntries(
      rows
        .filter((row) => metric === "intensity" || row.value >= 0)
        .map((row) => [row.key, row.display]),
    );

    return (
      <View style={styles.stack}>
        <NamesGrid
          stormsData={stormsData}
          onCellClick={(name) => select(String(name))}
          nameColors={nameColors}
          nameSubtitles={nameSubtitles}
        />
        <SpecialNamesList
          stormsData={stormsData}
          onNameClick={select}
          nameColors={nameColors}
          nameSubtitles={nameSubtitles}
        />
      </View>
    );
  }

  if (mode === "table") {
    const specialValues: Record<number, SpecialValue> = {};
    rows.forEach((row) => {
      const position = Number(row.key);
      if (isExternalPosition(position))
        specialValues[position] = { color: row.color, suffix: row.display };
    });

    return (
      <ScreenScroll>
        <StatGrid
          stormsData={stormsData}
          rows={rows}
          metric={metric}
          onCellClick={(position) => select(String(position))}
        />
        <SpecialButtons onPress={(position) => select(String(position))} values={specialValues} />
      </ScreenScroll>
    );
  }

  return (
    <DataList<StatRow>
      data={rows}
      keyExtractor={(row) => row.key}
      sortFields={sortFields}
      sortKey={`stats/${metric}/${filter}`}
      onRowPress={onSelectGroup}
      renderCard={(row, index) => (
        <DataCard
          ordinal={index + 1}
          title={titleOf(row, filter)}
          accentColor={row.color}
          fields={fieldsOf(row, metric, filter)}
          pressable
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    gap: 16,
  },
  value: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    lineHeight: 19,
    color: COLOR.text,
    fontVariant: ["tabular-nums"],
  },
});

export default StatsView;
