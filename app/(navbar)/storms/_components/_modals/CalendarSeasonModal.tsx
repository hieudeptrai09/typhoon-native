import DefModal from "@/lib/components/DefModal";
import ZoomEarth from "@/lib/components/ZoomEarth";
import { INTENSITY_LABEL } from "@/lib/constants";
import type { BaseModalProps, Storm } from "@/lib/types";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { daysBetween, formatLongDate, formatOrdinalDate } from "@/lib/utils/date";
import { isExternalPosition } from "@/lib/utils/position";
import type { ReactNode } from "react";
import { eventYearOf, getDayOfStorm, type SeasonGroup } from "../../_utils/calendar";

export type CalendarSeasonKind = "started" | "ended" | "active";

// The title names the date, so the sentences below never repeat it.
const THIS_DAY = "this day";

const SUMMARIES: Record<CalendarSeasonKind, (count: number) => ReactNode> = {
  started: (count) => <>{count === 1 ? "storm formed" : "storms formed"} on this day.</>,
  ended: (count) => <>{count === 1 ? "storm dissipated" : "storms dissipated"} on this day.</>,
  active: (count) => (
    <>{count === 1 ? "storm was" : "storms were"} out over the basin on this day.</>
  ),
};

// Positions 141-143 hold storms that wandered in from another basin: they were not born in
// the West Pacific and did not necessarily die there, so they enter and leave it instead.
const VERBS = {
  own: { start: "formed", end: "dissipated" },
  external: { start: "entered the basin", end: "dissipated or left the basin" },
};

// The values a reader is here for are bold; the words joining them are not.
const Fact = ({ children }: { children: ReactNode }) => (
  <span className="font-semibold">{children}</span>
);

const Lasted = ({ storm }: { storm: Storm }) => {
  const days = daysBetween(storm.dateStart, storm.dateEnd);
  if (days === null) return null;
  const total = days + 1;
  return (
    <>
      , lasting <Fact>{total === 1 ? "1 day" : `${total} days`}</Fact>
    </>
  );
};

const Peak = ({ storm }: { storm: Storm }) => (
  <Fact>{INTENSITY_LABEL[storm.intensity].toLowerCase()}</Fact>
);

// One sentence per storm, in the order a reader would ask for it: which storm, what it did
// on the chosen date, then the rest of its life. Reads as prose rather than as a record.
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

  if (kind === "started") {
    return (
      <>
        {verbs.start} on {THIS_DAY} and peaked as a <Peak storm={storm} />
        {storm.dateEnd ? (
          <>
            {" "}
            before it {verbs.end} on <Fact>{formatLongDate(storm.dateEnd)}</Fact>
            <Lasted storm={storm} />.
          </>
        ) : (
          <> and is still out over the basin.</>
        )}
      </>
    );
  }

  if (kind === "ended") {
    return (
      <>
        {verbs.end} on {THIS_DAY}
        <Lasted storm={storm} />, having {verbs.start} on{" "}
        <Fact>{formatLongDate(storm.dateStart)}</Fact> and peaked as a <Peak storm={storm} />.
      </>
    );
  }

  const { day, total } = getDayOfStorm(storm, monthDay);
  return (
    <>
      was on day <Fact>{total === null ? day : `${day} of ${total}`}</Fact> on {THIS_DAY} — it{" "}
      {verbs.start} on <Fact>{formatLongDate(storm.dateStart)}</Fact>, peaked as a{" "}
      <Peak storm={storm} />
      {storm.dateEnd ? (
        <>
          , and {verbs.end} on <Fact>{formatLongDate(storm.dateEnd)}</Fact>.
        </>
      ) : (
        <>, and is still out over the basin.</>
      )}
    </>
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
  <article className="space-y-1.5">
    <p className="m-0 text-sm leading-relaxed text-foreground">
      {/* The JTWC designation rides with the name, the way every other storm list writes it. */}
      <span className="font-bold" style={{ color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }}>
        {storm.name}
        {storm.jtwcDesignation && ` (${storm.jtwcDesignation})`}
      </span>{" "}
      <Sentence storm={storm} kind={kind} monthDay={monthDay} />
    </p>

    <ZoomEarth storm={storm} />
  </article>
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

  // Not the season year: a storm carried over the new year meets this day in the calendar
  // year either side of its season, and the title names a real date rather than a season.
  const eventYear = season?.storms[0] ? eventYearOf(season.storms[0], monthDay) : season?.year;

  return (
    <DefModal
      open={isOpen && season !== null}
      onClose={onClose}
      width={520}
      title={
        <span className="text-2xl font-bold text-foreground">
          {eventYear === undefined ? "" : formatOrdinalDate(monthDay, eventYear)}
        </span>
      }
    >
      <div className="flex flex-col gap-5 pt-4">
        <p className="m-0 text-sm text-foreground">
          <span className="font-semibold">{count}</span> {SUMMARIES[kind](count)}
        </p>

        {season?.storms.map((storm, index) => (
          <StormParagraph
            key={`${storm.name}-${index}`}
            storm={storm}
            kind={kind}
            monthDay={monthDay}
          />
        ))}
      </div>
    </DefModal>
  );
};

export default CalendarSeasonModal;
