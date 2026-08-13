import { useApiQuery } from "@/lib/api/client";
import FrownError from "@/lib/components/common/FrownError";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import DashboardPageContent from "@/lib/components/dashboard/DashboardPageContent";
import type { DashboardParams, Storm } from "@/lib/types";
import { paramsForView } from "@/lib/utils/storm/routing";
import { useState } from "react";

// The web build kept view/mode/filter in the URL so each combination could be linked and indexed.
// A tab has no address bar, and pushing a route per filter change would stack history entries the
// back gesture then has to unwind one by one, so the dashboard owns its filters as plain state.
export default function StormsScreen() {
  const [params, setParams] = useState<DashboardParams>(() => paramsForView("all"));

  const { data, isLoading, isError, refetch } = useApiQuery<Storm[]>("/api/v1/storms");

  if (isLoading) return <ScreenLoading />;
  if (isError) return <FrownError onRetry={refetch} />;

  return <DashboardPageContent stormsData={data} params={params} onParamsChange={setParams} />;
}
