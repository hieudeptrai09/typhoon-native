import DayStormDetail from "@/lib/components/calendar/DayStormDetail";
import DefModal from "@/lib/components/common/DefModal";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { BaseModalProps } from "@/lib/types";
import { formatMonthDay } from "@/lib/utils/date";
import type { DayEventKind, SpineYearRow } from "@/lib/utils/storm/calendar";
import { StyleSheet, Text, View } from "react-native";

const leadFor = (kind: DayEventKind, count: number): string => {
  const plural = count !== 1;

  if (kind === "ended") return `${plural ? "storms" : "storm"} dissipated on this day.`;
  if (kind === "active") {
    return `${plural ? "storms were" : "storm was"} out over the basin on this day.`;
  }
  return `${plural ? "storms" : "storm"} formed on this day.`;
};

interface DaySeasonModalProps extends BaseModalProps {
  row: SpineYearRow | null;
  kind: DayEventKind;
  monthDay: string;
  onOpenStorm: (name: string) => void;
}

const DaySeasonModal = ({
  isOpen,
  onClose,
  row,
  kind,
  monthDay,
  onOpenStorm,
}: DaySeasonModalProps) => {
  const count = row?.entries.length ?? 0;

  return (
    <DefModal
      open={isOpen && row !== null}
      onClose={onClose}
      title={
        <Text style={styles.title} numberOfLines={1}>
          {formatMonthDay(monthDay)} {row?.year}
        </Text>
      }
    >
      <Text style={styles.lead}>
        <Text style={styles.count}>{count}</Text> {leadFor(kind, count)}
      </Text>

      <View style={styles.storms}>
        {row?.entries.map((entry) => (
          <DayStormDetail
            key={entry.key}
            entry={entry}
            kind={kind}
            onOpen={() => {
              onClose();
              onOpenStorm(entry.storm.name);
            }}
          />
        ))}
      </View>
    </DefModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 20,
    color: COLOR.accent,
  },
  lead: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
  },
  count: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textSecondary,
  },
  storms: {
    gap: SPACE.lg,
    marginTop: SPACE.lg,
  },
});

export default DaySeasonModal;
