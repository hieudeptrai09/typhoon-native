import DayYearChart from "@/lib/components/calendar/DayYearChart";
import DefModal from "@/lib/components/common/DefModal";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { BaseModalProps } from "@/lib/types";
import { DAYS_OF_YEAR, formatMonthDay } from "@/lib/utils/date";
import { NAMING_LIST_FIRST_YEAR, rankDay } from "@/lib/utils/storm/calendar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface DayOverviewModalProps extends BaseModalProps {
  density: number[];
  monthDay: string;
  today: string;
  verb: string; // what the chart counts, e.g. "formed"
}

const DayOverviewModal = ({
  isOpen,
  onClose,
  density,
  monthDay,
  today,
  verb,
}: DayOverviewModalProps) => {
  // Scrubbing inspects the chart only; the calendar underneath keeps the day it was opened on.
  const [inspected, setInspected] = useState(monthDay);

  // Adjusted during render rather than in an effect, which would paint one frame of the previous
  // day before correcting itself.
  const [seen, setSeen] = useState({ isOpen, monthDay });
  if (seen.isOpen !== isOpen || seen.monthDay !== monthDay) {
    setSeen({ isOpen, monthDay });
    if (isOpen) setInspected(monthDay);
  }

  const rank = rankDay(density, inspected);

  return (
    <DefModal open={isOpen} onClose={onClose} title="Through the year">
      <Text style={styles.lead}>
        Storms {verb} on each day of the year. Drag the chart to read another day.
      </Text>

      <DayYearChart
        density={density}
        inspected={inspected}
        pageDay={monthDay}
        today={today}
        onInspect={setInspected}
      />

      <View style={styles.readout}>
        <Text style={styles.headline}>
          {formatMonthDay(inspected)}
          <Text style={styles.headlineCount}>
            {" · "}
            {rank.count} {rank.count === 1 ? "storm" : "storms"} {verb}
          </Text>
        </Text>

        <Text style={styles.caption}>
          {rank.count === 0
            ? `Nothing has ever happened here. `
            : `Ranks #${rank.rank} of ${DAYS_OF_YEAR.length} days. `}
          The busiest is {formatMonthDay(rank.busiest.monthDay)}, on {rank.busiest.count}.
        </Text>

        <Text style={styles.footnote}>
          Counted across every season since {NAMING_LIST_FIRST_YEAR}.
        </Text>
      </View>
    </DefModal>
  );
};

const styles = StyleSheet.create({
  lead: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: COLOR.textBody,
    marginBottom: SPACE.md,
  },
  readout: {
    gap: 3,
    marginTop: SPACE.md,
  },
  headline: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 15,
    color: COLOR.text,
  },
  headlineCount: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: COLOR.accent,
  },
  caption: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: COLOR.textMuted,
  },
  footnote: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 11,
    lineHeight: 16,
    color: COLOR.textFaint,
  },
});

export default DayOverviewModal;
