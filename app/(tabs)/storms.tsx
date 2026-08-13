import { useApiQuery } from "@/lib/api/client";
import { SortMemoryProvider } from "@/lib/components/common/DataList/sortMemory";
import FrownError from "@/lib/components/common/FrownError";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import DashboardPageContent from "@/lib/components/dashboard/DashboardPageContent";
import type { DashboardParams, Storm } from "@/lib/types";
import { paramsForView } from "@/lib/utils/storm/routing";
import { useCallback, useState } from "react";

// The web build kept view/mode/filter in the URL so each combination could be linked and indexed.
// A tab has no address bar, and pushing a route per filter change would stack history entries the
// back gesture then has to unwind one by one, so the dashboard owns its filters as plain state.
export default function StormsScreen() {
  const [view, setView] = useState("all");
  // Per view, because a phone user hops between views far more than a web user hopped between
  // pages — resetting to the default filter every time makes the trip back a fresh start.
  const [byView, setByView] = useState<Record<string, DashboardParams>>(() => ({
    all: paramsForView("all"),
  }));

  const { data, isLoading, isError, isRefetching, refetch } =
    useApiQuery<Storm[]>("/api/v1/storms");

  const selectView = useCallback((next: string) => {
    setView(next);
    setByView((current) => (current[next] ? current : { ...current, [next]: paramsForView(next) }));
  }, []);

  const changeParams = useCallback(
    (next: DashboardParams) => setByView((current) => ({ ...current, [next.view]: next })),
    [],
  );

  if (isLoading) return <ScreenLoading />;
  if (isError && !data) return <FrownError onRetry={refetch} />;

  return (
    <RefreshProvider value={{ refreshing: isRefetching, onRefresh: refetch }}>
      <SortMemoryProvider>
        <DashboardPageContent
          stormsData={data}
          params={byView[view] ?? paramsForView(view)}
          onParamsChange={changeParams}
          onSelectView={selectView}
          staleError={isError}
        />
      </SortMemoryProvider>
    </RefreshProvider>
  );
}
