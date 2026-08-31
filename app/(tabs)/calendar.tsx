import { useQuery } from "@/lib/api/client";
import CalendarPageContent from "@/lib/components/calendar/CalendarPageContent";
import { CALENDAR_SCOPES, type CalendarScope } from "@/lib/components/calendar/CalendarScopeTabs";
import { SortMemoryProvider } from "@/lib/components/common/DataList/sortMemory";
import FrownError from "@/lib/components/common/FrownError";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import { getStorms } from "@/lib/data/getStorms";
import { monthDayOf, todayISO } from "@/lib/utils/date";
import { usePersistedState } from "@/lib/utils/persistedState";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

const SCOPE_KEY = "calendar.scope";

const isScope = (value: unknown): value is CalendarScope =>
  CALENDAR_SCOPES.some((scope) => scope.key === value);

export default function CalendarScreen() {
  const { scope: scopeParam } = useLocalSearchParams<{ scope?: string }>();

  const [today] = useState(() => monthDayOf(todayISO()));
  // Deliberately not persisted: reopening days later on a scrubbed date reads as stale data.
  const [monthDay, setMonthDay] = useState(today);
  const [storedScope, setScope] = usePersistedState<CalendarScope>(SCOPE_KEY, "started");
  const scope = isScope(storedScope) ? storedScope : "started";

  // Cleared once applied, so arriving on the same scope twice still lands.
  useEffect(() => {
    if (!isScope(scopeParam)) return;
    setScope(scopeParam);
    router.setParams({ scope: "" });
  }, [scopeParam, setScope]);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery("storms", getStorms);

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
