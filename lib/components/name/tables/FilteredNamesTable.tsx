import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import NameStatusIcon from "@/lib/components/name/NameStatusIcon";
import type { TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import type { SortCriterion, SortField } from "@/lib/utils/table";
import { StyleSheet, Text, View } from "react-native";

interface FilteredNamesTableProps {
  filteredNames: TyphoonName[];
  onNamePress: (name: TyphoonName) => void;
}

const sortFields: SortField<TyphoonName>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  {
    key: "isRetired",
    label: "Retired",
    compare: (a, b) => Number(a.isRetired) - Number(b.isRetired),
  },
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  {
    key: "language",
    label: "Language",
    compare: (a, b) => (a.language ?? "").localeCompare(b.language ?? ""),
  },
  { key: "position", label: "Position", compare: (a, b) => a.position - b.position },
];

// Module-level so the identity is stable: DataList memoises the sorted rows off this.
const BY_NAME: SortCriterion[] = [{ key: "name", order: "ascend" }];

const statusLabel = (name: TyphoonName): string => {
  if (name.retirementReason === "misspell") return "Misspelled";
  return name.isRetired ? "Retired" : "Active";
};

const indexField = {
  key: "name",
  letterOf: (name: TyphoonName) => name.name.charAt(0).toUpperCase(),
};

const FilteredNamesTable = ({ filteredNames, onNamePress }: FilteredNamesTableProps) => {
  if (filteredNames.length === 0) return <EmptyResults />;

  return (
    <DataList<TyphoonName>
      data={filteredNames}
      keyExtractor={(name) => String(name.id)}
      sortFields={sortFields}
      sortKey="names"
      defaultSort={BY_NAME}
      indexField={indexField}
      countLabel={(count) => `${count} name${count === 1 ? "" : "s"}`}
      onRowPress={onNamePress}
      renderCard={(name, index) => (
        <DataCard
          ordinal={index + 1}
          title={name.name}
          titleColor={getNameStatusColor(name)}
          accentColor={getNameStatusColor(name)}
          fields={[
            {
              label: "Status",
              value: (
                <View style={styles.status}>
                  <NameStatusIcon
                    isRetired={name.isRetired}
                    retirementReason={name.retirementReason}
                    size={16}
                  />
                  <Text style={[styles.statusText, { color: getNameStatusColor(name) }]}>
                    {statusLabel(name)}
                  </Text>
                </View>
              ),
            },
            {
              label: "Contributed by",
              value: <CountryFlag country={name.country} size={16} showName />,
            },
            { label: "Language", value: name.language || "—" },
            { label: "Position", value: getPositionTitle(name.position) },
            { label: "Meaning", value: name.meaning || "—" },
          ]}
          pressable
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    lineHeight: 19,
  },
});

export default FilteredNamesTable;
