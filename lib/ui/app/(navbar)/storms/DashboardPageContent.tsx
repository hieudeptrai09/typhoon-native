"use client";

import FrownError from "@/lib/components/FrownError";
import PageHeader from "@/lib/components/PageHeader";
import { MONTH_NAMES } from "@/lib/constants";
import type { DashboardParams, Storm } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import { calculateAverage, calculateGapAverage, getGroupedStorms } from "@/lib/utils/storms";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DashboardLegend from "./_components/_legends/DashboardLegend";
import AverageModal, { type AverageModalCriteria } from "./_components/_modals/AverageModal";
import AvgDateModal from "./_components/_modals/AvgDateModal";
import DistanceModal from "./_components/_modals/DistanceModal";
import NameListModal from "./_components/_modals/NameListModal";
import StormDetailModal from "./_components/_modals/StormDetailModal";
import AverageView from "./_components/_views/AverageView";
import AvgDateView from "./_components/_views/AvgDateView";
import DistanceView from "./_components/_views/DistanceView";
import HighlightsView from "./_components/_views/HighlightsView";
import StormsView from "./_components/_views/StormsView";
import DashboardControlBar from "./_components/_widgets/DashboardControlBar";
import { getDashboardTitle } from "./_utils/metadata";
import { paramsToPath, slugToParams } from "./_utils/routing";
import { getEffectiveMonth } from "./_utils/stats";

interface SelectedData {
  title?: string;
  storms?: Storm[];
  name?: string;
  avgIntensity?: number;
  average?: number;
  criteria?: AverageModalCriteria;
}

interface DashboardPageContentProps {
  stormsData: Storm[] | null;
}

export default function DashboardPageContent({ stormsData }: DashboardPageContentProps) {
  const router = useRouter();
  const { slug } = useParams<{ slug: string[] }>();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAverageModalOpen, setIsAverageModalOpen] = useState(false);
  const [isNameListModalOpen, setIsNameListModalOpen] = useState(false);
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [isAvgDateModalOpen, setIsAvgDateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null);

  const currentParams: DashboardParams = slugToParams(slug);
  const { view, mode, filter } = currentParams;

  const averageValues =
    view === "average" || view === "all"
      ? Object.fromEntries(
          Object.entries(getGroupedStorms(stormsData || [], "position")).map(
            ([position, storms]) => [Number(position), calculateAverage(storms)],
          ),
        )
      : null;

  const handleApplyFilter = (newParams: DashboardParams) => {
    router.push(paramsToPath(newParams));
  };

  const handleCellClick = (data: number | string, key: string) => {
    const storms = (stormsData || []).filter((s) => s[key as keyof Storm] === data);

    // Storms view — name list mode: clicking a name row
    if (view === "all" && key === "name") {
      const avgIntensity = calculateAverage(storms);
      setSelectedData({ name: data as string, storms, avgIntensity });
      setIsNameListModalOpen(true);
      return;
    }

    // Storms view — any table mode (position or name grid): clicking a cell
    if (view === "all" && key === "position") {
      const title = key === "position" ? getPositionTitle(Number(data)) : String(data);
      setSelectedData({ title, storms });
      setIsDetailModalOpen(true);
      return;
    }

    if (view === "average" && filter === "name") {
      setSelectedData({
        title: String(data),
        average: calculateAverage(storms),
        storms,
        criteria: "name",
      });
      setIsAverageModalOpen(true);
      return;
    }

    // Average / month: clicking a month row opens storm detail modal
    if (view === "average" && filter === "month") {
      const monthName = MONTH_NAMES[data as number];
      const monthStorms = (stormsData || []).filter(
        (s) => getEffectiveMonth(s) === (data as number),
      );
      setSelectedData({
        title: monthName,
        storms: monthStorms,
        average: calculateAverage(monthStorms),
        criteria: "month",
      });
      setIsAverageModalOpen(true);
      return;
    }

    // Recurrence view: clicking a position or name opens the recurrence timeline
    if (view === "recurrence") {
      const title = key === "position" ? getPositionTitle(Number(data)) : String(data);
      setSelectedData({ title, storms, average: calculateGapAverage(storms) });
      setIsDistanceModalOpen(true);
      return;
    }

    // Avg. Date view: clicking a position or name opens the seasonal date modal
    if (view === "avgdate") {
      const title = key === "position" ? getPositionTitle(Number(data)) : String(data);
      setSelectedData({ title, storms });
      setIsAvgDateModalOpen(true);
      return;
    }

    const titleMap: Record<string, string> = {
      position: getPositionTitle(Number(data)),
      country: data as string,
      year: `Year ${data}`,
    };

    setSelectedData({
      title: titleMap[key],
      average: calculateAverage(storms),
      storms,
      criteria: key as AverageModalCriteria,
    });
    setIsAverageModalOpen(true);
  };

  if (!stormsData) {
    return <FrownError />;
  }

  return (
    <PageHeader title={getDashboardTitle(view, mode, filter)}>
      <DashboardControlBar params={currentParams} onChange={handleApplyFilter} />

      {(() => {
        switch (view) {
          case "all":
            return (
              <StormsView
                params={currentParams}
                stormsData={stormsData}
                averageValues={averageValues}
                onCellClick={handleCellClick}
              />
            );
          case "highlights":
            return <HighlightsView params={currentParams} stormsData={stormsData} />;
          case "average":
            return (
              <AverageView
                params={currentParams}
                stormsData={stormsData}
                averageValues={averageValues}
                onCellClick={handleCellClick}
              />
            );
          case "recurrence":
            return (
              <DistanceView
                params={currentParams}
                stormsData={stormsData}
                onCellClick={handleCellClick}
              />
            );
          case "avgdate":
            return (
              <AvgDateView
                params={currentParams}
                stormsData={stormsData}
                onCellClick={handleCellClick}
              />
            );
          default:
            return <div className="text-center text-foreground">Select filters to view data</div>;
        }
      })()}

      <StormDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedData?.title || ""}
        storms={selectedData?.storms || []}
      />

      <AverageModal
        isOpen={isAverageModalOpen}
        onClose={() => setIsAverageModalOpen(false)}
        title={selectedData?.title || ""}
        average={selectedData?.average || 0}
        storms={selectedData?.storms || []}
        criteria={selectedData?.criteria || "position"}
      />

      <NameListModal
        isOpen={isNameListModalOpen}
        onClose={() => setIsNameListModalOpen(false)}
        name={selectedData?.name || ""}
        storms={selectedData?.storms || []}
        avgIntensity={selectedData?.avgIntensity || 0}
      />

      <DistanceModal
        isOpen={isDistanceModalOpen}
        onClose={() => setIsDistanceModalOpen(false)}
        title={selectedData?.title || ""}
        storms={selectedData?.storms || []}
        average={selectedData?.average ?? -1}
      />

      <AvgDateModal
        isOpen={isAvgDateModalOpen}
        onClose={() => setIsAvgDateModalOpen(false)}
        title={selectedData?.title || ""}
        storms={selectedData?.storms || []}
      />

      <DashboardLegend params={currentParams} />
    </PageHeader>
  );
}
