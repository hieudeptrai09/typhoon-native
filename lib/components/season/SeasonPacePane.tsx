import SeasonMonthsModal from "@/lib/components/season/SeasonMonthsModal";
import SeasonToDateList from "@/lib/components/season/SeasonToDateList";
import type { Storm } from "@/lib/types";
import { getSeasonToDate, type SeasonToDateRow } from "@/lib/utils/storm/calendar";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

interface SeasonPacePaneProps {
  stormsData: Storm[];
  monthDay: string;
}

const SeasonPacePane = ({ stormsData, monthDay }: SeasonPacePaneProps) => {
  const [openSeason, setOpenSeason] = useState<SeasonToDateRow | null>(null);

  const rows = useMemo(() => getSeasonToDate(stormsData, monthDay), [stormsData, monthDay]);

  return (
    <View style={styles.root}>
      <SeasonToDateList rows={rows} onSeasonPress={setOpenSeason} />

      <SeasonMonthsModal
        isOpen={openSeason !== null}
        onClose={() => setOpenSeason(null)}
        row={openSeason}
        monthDay={monthDay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default SeasonPacePane;
