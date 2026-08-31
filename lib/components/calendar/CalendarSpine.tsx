import DaySeasonModal from "@/lib/components/calendar/DaySeasonModal";
import SpineYearRow from "@/lib/components/calendar/SpineYearRow";
import DataList from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import type { DayEventKind, SpineYearRow as Row } from "@/lib/utils/storm/calendar";
import { useRouter } from "expo-router";
import { useState } from "react";

interface CalendarSpineProps {
  rows: Row[];
  kind: DayEventKind;
  monthDay: string;
  emptyDescription: string;
}

const CalendarSpine = ({ rows, kind, monthDay, emptyDescription }: CalendarSpineProps) => {
  const router = useRouter();
  const [openRow, setOpenRow] = useState<Row | null>(null);

  const openStorm = (name: string) => router.push(`/info/${name.toLowerCase()}`);

  return (
    <>
      <DataList<Row>
        data={rows}
        keyExtractor={(row) => String(row.year)}
        empty={<EmptyResults icon="calendar-outline" description={emptyDescription} />}
        renderCard={(row) => (
          <SpineYearRow
            row={row}
            kind={kind}
            onOpen={() => setOpenRow(row)}
            onOpenStorm={openStorm}
          />
        )}
      />

      <DaySeasonModal
        isOpen={openRow !== null}
        onClose={() => setOpenRow(null)}
        row={openRow}
        kind={kind}
        monthDay={monthDay}
        onOpenStorm={openStorm}
      />
    </>
  );
};

export default CalendarSpine;
