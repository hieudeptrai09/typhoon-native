import FrownError from "@/lib/components/common/FrownError";
import type { DetailTarget } from "@/lib/components/common/OpenDetailButton";
import StaleBanner from "@/lib/components/common/StaleBanner";
import DashboardLegend from "@/lib/components/dashboard/legends/DashboardLegend";
import AverageModal, {
  type AverageModalCriteria,
} from "@/lib/components/dashboard/modals/AverageModal";
import AvgDateModal from "@/lib/components/dashboard/modals/AvgDateModal";
import DistanceModal from "@/lib/components/dashboard/modals/DistanceModal";
import NameListModal from "@/lib/components/dashboard/modals/NameListModal";
import StormDetailModal from "@/lib/components/dashboard/modals/StormDetailModal";
import AverageView from "@/lib/components/dashboard/views/AverageView";
import AvgDateView from "@/lib/components/dashboard/views/AvgDateView";
import DistanceView from "@/lib/components/dashboard/views/DistanceView";
import HighlightsView from "@/lib/components/dashboard/views/HighlightsView";
import StormsView from "@/lib/components/dashboard/views/StormsView";
import DashboardControlBar from "@/lib/components/dashboard/widgets/DashboardControlBar";
import { MONTH_NAMES } from "@/lib/constants";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { DashboardParams, Storm } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  calculateGapAverage,
  getGroupedStorms,
} from "@/lib/utils/storm/aggregate";
import { getEffectiveMonth } from "@/lib/utils/storm/highlights";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface SelectedData {
  title?: string;
  storms?: Storm[];
  name?: string;
  avgIntensity?: number;
  average?: number;
  criteria?: AverageModalCriteria;
  /** Absent for groupings with no screen behind them, e.g. a year or a month. */
  target?: DetailTarget;
}

// Only the two groupings the app has a detail route for; the rest end at the sheet by design.
const targetFor = (data: number | string, key: string): DetailTarget | undefined => {
  if (key === "position") return { kind: "position", position: Number(data) };
  if (key === "name") return { kind: "name", name: String(data) };
  return undefined;
};

interface DashboardPageContentProps {
  stormsData: Storm[] | null;
  params: DashboardParams;
  onParamsChange: (params: DashboardParams) => void;
  onSelectView: (view: string) => void;
  staleError?: boolean;
}

export default function DashboardPageContent({
  stormsData,
  params: currentParams,
  onParamsChange,
  onSelectView,
  staleError = false,
}: DashboardPageContentProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAverageModalOpen, setIsAverageModalOpen] = useState(false);
  const [isNameListModalOpen, setIsNameListModalOpen] = useState(false);
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [isAvgDateModalOpen, setIsAvgDateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null);

  const { view, filter } = currentParams;

  const averageValues =
    view === "average" || view === "all"
      ? Object.fromEntries(
          Object.entries(getGroupedStorms(stormsData || [], "position")).map(
            ([position, storms]) => [Number(position), calculateAverage(storms)],
          ),
        )
      : null;

  const handleCellClick = (data: number | string, key: string) => {
    const storms = (stormsData || []).filter((s) => s[key as keyof Storm] === data);
    const target = targetFor(data, key);

    if (view === "all" && key === "name") {
      const avgIntensity = calculateAverage(storms);
      setSelectedData({ name: data as string, storms, avgIntensity, target });
      setIsNameListModalOpen(true);
      return;
    }

    if (view === "all" && key === "position") {
      const title = key === "position" ? getPositionTitle(Number(data)) : String(data);
      setSelectedData({ title, storms, target });
      setIsDetailModalOpen(true);
      return;
    }

    if (view === "average" && filter === "name") {
      setSelectedData({
        title: String(data),
        average: calculateAverage(storms),
        storms,
        criteria: "name",
        target,
      });
      setIsAverageModalOpen(true);
      return;
    }

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

    if (view === "recurrence") {
      const title = key === "position" ? getPositionTitle(Number(data)) : String(data);
      setSelectedData({ title, storms, average: calculateGapAverage(storms), target });
      setIsDistanceModalOpen(true);
      return;
    }

    if (view === "avgdate") {
      const avgDateTitles: Record<string, string> = {
        position: getPositionTitle(Number(data)),
        year: `Year ${data}`,
      };
      setSelectedData({ title: avgDateTitles[key] ?? String(data), storms, target });
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
      target,
    });
    setIsAverageModalOpen(true);
  };

  if (!stormsData) {
    return <FrownError />;
  }

  return (
    <View style={styles.root}>
      <DashboardControlBar
        params={currentParams}
        onChange={onParamsChange}
        onSelectView={onSelectView}
      />

      {staleError && <StaleBanner />}

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
            return <Text style={styles.hint}>Select filters to view data</Text>;
        }
      })()}

      <StormDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedData?.title || ""}
        storms={selectedData?.storms || []}
        position={
          selectedData?.target?.kind === "position" ? selectedData.target.position : undefined
        }
      />

      <AverageModal
        isOpen={isAverageModalOpen}
        onClose={() => setIsAverageModalOpen(false)}
        title={selectedData?.title || ""}
        average={selectedData?.average || 0}
        storms={selectedData?.storms || []}
        criteria={selectedData?.criteria || "position"}
        target={selectedData?.target}
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
        target={selectedData?.target}
      />

      <AvgDateModal
        isOpen={isAvgDateModalOpen}
        onClose={() => setIsAvgDateModalOpen(false)}
        title={selectedData?.title || ""}
        storms={selectedData?.storms || []}
        target={selectedData?.target}
      />

      <DashboardLegend params={currentParams} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hint: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
    textAlign: "center",
    paddingHorizontal: SPACE.xl,
    paddingVertical: SPACE.xxl,
  },
});
