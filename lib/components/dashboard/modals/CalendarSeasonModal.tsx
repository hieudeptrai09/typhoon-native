import DefModal from "@/lib/components/common/DefModal";
import ZoomEarthLink from "@/lib/components/common/ZoomEarthLink";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps, Storm } from "@/lib/types";
import { daysBetween, formatLongDate, formatOrdinalDate } from "@/lib/utils/date";
import { isExternalPosition } from "@/lib/utils/position";
import { eventYearOf, getDayOfStorm, type SeasonGroup } from "@/lib/utils/storm/calendar";
import { StyleSheet, Text, View } from "react-native";

export type CalendarSeasonKind = "started" | "ended" | "active";

// The title names the date, so the sentences below never repeat it.
const THIS_DAY = "this day";

const summaryOf = (kind: CalendarSeasonKind, count: number): string => {
  const plural = count !== 1;
  if (kind === "started") return `${plural ? "storms formed" : "storm formed"} on ${THIS_DAY}.`;
  if (kind === "ended")
    return `${plural ? "storms dissipated" : "storm dissipated"} on ${THIS_DAY}.`;
  return `${plural ? "storms were" : "storm was"} out over the basin on ${THIS_DAY}.`;
};

// Positions 141-143 hold storms that wandered in from another basin: they were not born in the
// West Pacific and did not necessarily die there, so they enter and leave it instead.
const VERBS = {
  own: { start: "formed", end: "dissipated" },
  external: { start: "entered the basin", end: "dissipated or left the basin" },
};

const Fact = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.fact}>{children}</Text>
);

const Lasted = ({ storm }: { storm: Storm }) => {
  const days = daysBetween(storm.dateStart, storm.dateEnd);
  if (days === null) return null;
  const total = days + 1;
  return (
    <Text>
      , lasting <Fact>{total === 1 ? "1 day" : `${total} days`}</Fact>
    </Text>
  );
};

// One sentence per storm, in the order a reader would ask for it: which storm, what it did on the
// chosen date, then the rest of its life. Reads as prose rather than as a record.
const Sentence = ({
  storm,
  kind,
  monthDay,
}: {
  storm: Storm;
  kind: CalendarSeasonKind;
  monthDay: string;
}) => {
  const verbs = isExternalPosition(storm.position) ? VERBS.external : VERBS.own;
  const peak = <Fact>{INTENSITY_LABEL[storm.intensity].toLowerCase()}</Fact>;

  if (kind === "started") {
    return (
      <Text>
        {verbs.start} on {THIS_DAY} and peaked as a {peak}
        {storm.dateEnd ? (
          <Text>
            {" "}
            before it {verbs.end} on <Fact>{formatLongDate(storm.dateEnd)}</Fact>
            <Lasted storm={storm} />.
          </Text>
        ) : (
          <Text> and is still out over the basin.</Text>
        )}
      </Text>
    );
  }

  if (kind === "ended") {
    return (
      <Text>
        {verbs.end} on {THIS_DAY}
        <Lasted storm={storm} />, having {verbs.start} on{" "}
        <Fact>{formatLongDate(storm.dateStart)}</Fact> and peaked as a {peak}.
      </Text>
    );
  }

  const { day, total } = getDayOfStorm(storm, monthDay);
  return (
    <Text>
      was on day <Fact>{total === null ? day : `${day} of ${total}`}</Fact> on {THIS_DAY} — it{" "}
      {verbs.start} on <Fact>{formatLongDate(storm.dateStart)}</Fact>, peaked as a {peak}
      {storm.dateEnd ? (
        <Text>
          , and {verbs.end} on <Fact>{formatLongDate(storm.dateEnd)}</Fact>.
        </Text>
      ) : (
        <Text>, and is still out over the basin.</Text>
      )}
    </Text>
  );
};

const StormParagraph = ({
  storm,
  kind,
  monthDay,
}: {
  storm: Storm;
  kind: CalendarSeasonKind;
  monthDay: string;
}) => (
  <View style={styles.paragraph}>
    <Text style={styles.prose}>
      {/* The JTWC designation rides with the name, the way every other storm list writes it. */}
      <Text style={[styles.stormName, { color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }]}>
        {storm.name}
        {storm.jtwcDesignation ? ` (${storm.jtwcDesignation})` : ""}
      </Text>{" "}
      <Sentence storm={storm} kind={kind} monthDay={monthDay} />
    </Text>

    <ZoomEarthLink storm={storm} />
  </View>
);

interface CalendarSeasonModalProps extends BaseModalProps {
  season: SeasonGroup | null;
  kind: CalendarSeasonKind;
  monthDay: string;
}

const CalendarSeasonModal = ({
  isOpen,
  onClose,
  season,
  kind,
  monthDay,
}: CalendarSeasonModalProps) => {
  const count = season?.storms.length ?? 0;

  // Not the season year: a storm carried over the new year meets this day in the calendar year
  // either side of its season, and the title names a real date rather than a season.
  const eventYear = season?.storms[0] ? eventYearOf(season.storms[0], monthDay) : season?.year;

  return (
    <DefModal
      open={isOpen && season !== null}
      onClose={onClose}
      title={
        <Text style={styles.title} numberOfLines={1}>
          {eventYear === undefined ? "" : formatOrdinalDate(monthDay, eventYear)}
        </Text>
      }
    >
      <Text style={styles.summary}>
        <Text style={styles.fact}>{count}</Text> {summaryOf(kind, count)}
      </Text>

      <View style={styles.storms}>
        {season?.storms.map((storm, index) => (
          <StormParagraph
            key={`${storm.name}-${index}`}
            storm={storm}
            kind={kind}
            monthDay={monthDay}
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
  summary: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
  },
  storms: {
    gap: 18,
    marginTop: 18,
  },
  paragraph: {
    gap: 6,
    alignItems: "flex-start",
  },
  prose: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: COLOR.textBody,
  },
  stormName: {
    fontFamily: "OpenSans_700Bold",
  },
  // The values a reader is here for are bold; the words joining them are not.
  fact: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textSecondary,
  },
});

export default CalendarSeasonModal;
