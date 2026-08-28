import { useApiQuery } from "@/lib/api/client";
import CalendarPageContent from "@/lib/components/calendar/CalendarPageContent";
import type { CalendarScope } from "@/lib/components/calendar/CalendarScopeTabs";
import { SortMemoryProvider } from "@/lib/components/common/DataList/sortMemory";
import FrownError from "@/lib/components/common/FrownError";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import type { Storm } from "@/lib/types";
import { monthDayOf, todayISO } from "@/lib/utils/date";
import { useMemo, useState } from "react";

export default function CalendarScreen() {
  const [today] = useState(() => monthDayOf(todayISO()));
  const [monthDay, setMonthDay] = useState(today);
  const [scope, setScope] = useState<CalendarScope>("started");

  const { data, isLoading, isError, isRefetching, refetch } =
    useApiQuery<Storm[]>("/api/v1/storms");

  const refreshValue = useMemo(
    () => ({ refreshing: isRefetching, onRefresh: refetch }),
    [isRefetching, refetch],
  );

  if (isLoading) return <ScreenLoading />;
  if (!data) return <FrownError onRetry={refetch} />;

  return (
    <RefreshProvider value={refreshValue}>
      <SortMemoryProvider>
        <CalendarPageContent
          stormsData={data}
          scope={scope}
          onScopeChange={setScope}
          monthDay={monthDay}
          today={today}
          onMonthDayChange={setMonthDay}
          staleError={isError}
        />
      </SortMemoryProvider>
    </RefreshProvider>
  );
}
