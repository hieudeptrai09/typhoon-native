import ComparisonBarList, {
  type ComparisonBarRow,
} from "@/lib/components/common/ComparisonBarList";
import DefModal from "@/lib/components/common/DefModal";
import OpenDetailButton, { type DetailTarget } from "@/lib/components/common/OpenDetailButton";
import {
  BACKGROUND_BADGE,
  INTENSITY_LABEL,
  INTENSITY_RANK,
  SORTING_RANK,
  TEXT_COLOR_WHITE_BACKGROUND,
} from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps, IntensityType, Storm } from "@/lib/types";
import { getGroupedStorms, getIntensityFromNumber } from "@/lib/utils/storm/aggregate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

export type AverageModalCriteria = "position" | "country" | "year" | "month" | "name";

interface AverageModalProps extends BaseModalProps {
  title: string;
  average: number;
  storms: Storm[];
  criteria: AverageModalCriteria;
  /** Only position and name groupings have a screen of their own; year/month/country do not. */
  target?: DetailTarget;
}

interface IntensityGroupData {
  intensity: IntensityType;
  count: number;
  storms: Storm[];
}

const POSITION_AGENCIES = new Set(["CPHC", "NHC", "IMD"]);

const CRITERIA_TEXT: Record<
  AverageModalCriteria,
  { heading: (title: string) => string; empty: (title: string) => string }
> = {
  position: {
    heading: (title) =>
      POSITION_AGENCIES.has(title)
        ? `Storms which are named by ${title}, by intensity:`
        : `Storms in position ${title} by intensity:`,
    empty: (title) =>
      POSITION_AGENCIES.has(title)
        ? `No storms named by ${title}.`
        : `No storms in position ${title}.`,
  },
  country: {
    heading: (title) => `Storms whose names were contributed by ${title}, by intensity:`,
    empty: (title) => `No storms whose names were contributed by ${title}.`,
  },
  year: {
    heading: (title) => `Storms in ${title} by intensity:`,
    empty: (title) => `No storms in ${title}.`,
  },
  month: {
    heading: (title) => `Storms in ${title} by intensity:`,
    empty: (title) => `No storms in ${title}.`,
  },
  name: {
    heading: (title) => `Storms named ${title} by intensity:`,
    empty: (title) => `No storms named ${title}.`,
  },
};

// Negative ranks need the parentheses to stay readable next to the × sign.
const formatRank = (rank: number) => (rank < 0 ? `(−${Math.abs(rank)})` : String(rank));

// (2×5 + 1×2 + 3×0) ÷ 6 = 12 ÷ 6 = 2.00 — one term per intensity row below.
const AverageFormula = ({
  average,
  intensityData,
  total,
}: {
  average: number;
  intensityData: IntensityGroupData[];
  total: number;
}) => {
  const rankSum = intensityData.reduce(
    (sum, data) => sum + data.count * INTENSITY_RANK[data.intensity],
    0,
  );

  const terms = intensityData
    .map((data) => `${data.count}×${formatRank(INTENSITY_RANK[data.intensity])}`)
    .join(" + ");

  return (
    <View style={styles.formula}>
      <Text style={styles.formulaText}>
        ({terms}) ÷ {total} = {formatRank(rankSum)} ÷ {total} ={" "}
        <Text style={styles.formulaResult}>{average.toFixed(2)}</Text>
      </Text>
    </View>
  );
};

const AverageModal = ({
  isOpen,
  onClose,
  title,
  average,
  storms,
  criteria,
  target,
}: AverageModalProps) => {
  const [showFormula, setShowFormula] = useState(false);

  const { heading, empty } = CRITERIA_TEXT[criteria];
  const intensityGroups = getGroupedStorms(storms, "intensity");
  const intensityData: IntensityGroupData[] = Object.entries(intensityGroups)
    .map(([intensity, groupStorms]) => ({
      intensity: intensity as IntensityType,
      count: groupStorms.length,
      storms: [...groupStorms].sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => SORTING_RANK[b.intensity] - SORTING_RANK[a.intensity]);

  const rows: ComparisonBarRow[] = intensityData.map((data) => ({
    key: data.intensity,
    label: INTENSITY_LABEL[data.intensity],
    labelColor: TEXT_COLOR_WHITE_BACKGROUND[data.intensity],
    color: BACKGROUND_BADGE[data.intensity],
    count: data.count,
    details: (
      <>
        {data.storms.map((storm) => (
          <Text key={`${storm.name}-${storm.year}`} style={styles.storm}>
            <Text
              style={[styles.stormName, { color: TEXT_COLOR_WHITE_BACKGROUND[data.intensity] }]}
            >
              {storm.name}
            </Text>{" "}
            {storm.year}
          </Text>
        ))}
      </>
    ),
  }));

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      title={title}
      footer={target ? <OpenDetailButton target={target} onClose={onClose} /> : undefined}
    >
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Overall Average Intensity:</Text>
        <Text
          style={[
            styles.summaryValue,
            { color: TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(average)] },
          ]}
        >
          {average.toFixed(2)}
        </Text>
        <Text style={styles.scale}>on a −2 to 5 scale</Text>
        {storms.length > 0 && (
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowFormula((current) => !current);
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="How the average intensity is calculated"
            accessibilityState={{ expanded: showFormula }}
          >
            <Ionicons
              name={showFormula ? "information-circle" : "information-circle-outline"}
              size={18}
              color={showFormula ? COLOR.accent : COLOR.textMuted}
            />
          </Pressable>
        )}
      </View>

      {showFormula && (
        <AverageFormula average={average} intensityData={intensityData} total={storms.length} />
      )}

      <ComparisonBarList heading={heading(title)} emptyText={empty(title)} rows={rows} />
    </DefModal>
  );
};

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 8,
    rowGap: 4,
  },
  summaryLabel: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
  },
  summaryValue: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 17,
    fontVariant: ["tabular-nums"],
  },
  scale: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  formula: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLOR.surfaceMuted,
  },
  formulaText: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    lineHeight: 20,
    color: COLOR.textBody,
    fontVariant: ["tabular-nums"],
  },
  formulaResult: {
    fontFamily: "OpenSans_700Bold",
    color: COLOR.text,
  },
  storm: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textBody,
  },
  stormName: {
    fontFamily: "OpenSans_600SemiBold",
  },
});

export default AverageModal;
