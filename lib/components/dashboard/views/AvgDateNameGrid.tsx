import NamesGrid from "@/lib/components/dashboard/grids/NamesGrid";
import SpecialNamesList from "@/lib/components/dashboard/widgets/SpecialNamesList";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { calculateAvgDatesByGroup, formatDayOfYear, getDoyMonth } from "@/lib/utils/storm/dates";
import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AvgDateNameGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

const DatePart = ({ doy }: { doy: number }) => (
  <Text style={{ color: getAvgDateColor(getDoyMonth(doy)) }}>{formatDayOfYear(doy)}</Text>
);

const AvgDateNameGrid = ({ stormsData, onCellClick }: AvgDateNameGridProps) => {
  const nameSubtitles = useMemo<Record<string, ReactNode>>(() => {
    const result: Record<string, ReactNode> = {};
    Object.entries(calculateAvgDatesByGroup(stormsData, "name")).forEach(
      ([name, { startDoy, endDoy }]) => {
        if (startDoy < 0 && endDoy < 0) return;
        result[name] = (
          <>
            <DatePart doy={startDoy} />
            <Text style={styles.separator}> – </Text>
            <DatePart doy={endDoy} />
          </>
        );
      },
    );
    return result;
  }, [stormsData]);

  return (
    <View style={styles.root}>
      <NamesGrid stormsData={stormsData} onCellClick={onCellClick} nameSubtitles={nameSubtitles} />
      <SpecialNamesList
        stormsData={stormsData}
        nameSubtitles={nameSubtitles}
        onNameClick={(name) => onCellClick(name, "name")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 16,
  },
  separator: {
    color: COLOR.textFaint,
  },
});

export default AvgDateNameGrid;
