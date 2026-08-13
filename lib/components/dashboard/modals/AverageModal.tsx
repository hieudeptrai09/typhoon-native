import DefModal from "@/lib/components/common/DefModal";
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
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

export type AverageModalCriteria = "position" | "country" | "year" | "month" | "name";

interface AverageModalProps extends BaseModalProps {
  title: string;
  average: number;
  storms: Storm[];
  criteria: AverageModalCriteria;
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

const AverageModal = ({ isOpen, onClose, title, average, storms, criteria }: AverageModalProps) => {
  // Web showed both the formula and each group's storms on hover. Touch has no hover, so both
  // expand in place — one open group at a time, so the sheet does not grow past a scroll or two.
  const [showFormula, setShowFormula] = useState(false);
  const [expanded, setExpanded] = useState<IntensityType | null>(null);

  const { heading, empty } = CRITERIA_TEXT[criteria];
  const intensityGroups = getGroupedStorms(storms, "intensity");
  const intensityData: IntensityGroupData[] = Object.entries(intensityGroups)
    .map(([intensity, groupStorms]) => ({
      intensity: intensity as IntensityType,
      count: groupStorms.length,
      storms: [...groupStorms].sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => SORTING_RANK[b.intensity] - SORTING_RANK[a.intensity]);
  const maxCount = intensityData.reduce((max, data) => Math.max(max, data.count), 0);

  const toggle = (intensity: IntensityType) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => (current === intensity ? null : intensity));
  };

  return (
    <DefModal open={isOpen} onClose={onClose} title={title}>
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

      <Text style={styles.heading}>{heading(title)}</Text>

      {intensityData.length === 0 && <Text style={styles.empty}>{empty(title)}</Text>}

      <View style={styles.groups}>
        {intensityData.map((data) => {
          const bgColor = BACKGROUND_BADGE[data.intensity];
          const textColor = TEXT_COLOR_WHITE_BACKGROUND[data.intensity];
          const isExpanded = expanded === data.intensity;

          return (
            <View key={data.intensity}>
              <Pressable
                onPress={() => toggle(data.intensity)}
                style={({ pressed }) => [
                  styles.group,
                  { borderLeftColor: bgColor },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                accessibilityLabel={`${INTENSITY_LABEL[data.intensity]}, ${data.count} storms`}
              >
                <Text style={[styles.groupLabel, { color: textColor }]} numberOfLines={1}>
                  {INTENSITY_LABEL[data.intensity]}
                </Text>

                <View style={styles.groupStats}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: maxCount > 0 ? Math.max(8, (data.count / maxCount) * 96) : 8,
                        backgroundColor: bgColor,
                      },
                    ]}
                  />
                  <Text style={styles.count}>{data.count}</Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={COLOR.textFaint}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={styles.stormList}>
                  {data.storms.map((storm) => (
                    <Text key={`${storm.name}-${storm.year}`} style={styles.storm}>
                      <Text style={[styles.stormName, { color: textColor }]}>{storm.name}</Text>{" "}
                      {storm.year}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
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
  heading: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textBody,
    marginTop: 16,
    marginBottom: 8,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  groups: {
    gap: 8,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: COLOR.surfaceSubtle,
  },
  pressed: {
    backgroundColor: COLOR.surfaceSunken,
  },
  groupLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
  },
  groupStats: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  count: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textBody,
    fontVariant: ["tabular-nums"],
  },
  stormList: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
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
