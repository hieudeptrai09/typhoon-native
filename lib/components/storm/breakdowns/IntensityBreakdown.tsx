import ComparisonBarList, {
  type ComparisonBarRow,
} from "@/lib/components/common/ComparisonBarList";
import {
  BACKGROUND_BADGE,
  INTENSITY_LABEL,
  INTENSITY_RANK,
  TEXT_COLOR_WHITE_BACKGROUND,
} from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import {
  calculateAverage,
  getIntensityGroups,
  type IntensityGroup,
} from "@/lib/utils/storm/aggregate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

interface IntensityBreakdownProps {
  storms: Storm[];
  heading?: string;
  emptyText?: string;
}

// Negative ranks need the parentheses to stay readable next to the × sign.
const formatRank = (rank: number) => (rank < 0 ? `(−${Math.abs(rank)})` : String(rank));

// (2×5 + 1×2 + 3×0) ÷ 6 = 12 ÷ 6 = 2.00 — one term per intensity row below.
const AverageFormula = ({
  average,
  groups,
  total,
}: {
  average: number;
  groups: IntensityGroup[];
  total: number;
}) => {
  const rankSum = groups.reduce((sum, g) => sum + g.storms.length * INTENSITY_RANK[g.intensity], 0);
  const terms = groups
    .map((g) => `${g.storms.length}×${formatRank(INTENSITY_RANK[g.intensity])}`)
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

const IntensityBreakdown = ({
  storms,
  heading = "Storms by intensity:",
  emptyText = "No storms to show.",
}: IntensityBreakdownProps) => {
  const [showFormula, setShowFormula] = useState(false);

  const groups = getIntensityGroups(storms);

  const rows: ComparisonBarRow[] = groups.map((group) => ({
    key: group.intensity,
    label: INTENSITY_LABEL[group.intensity],
    labelColor: TEXT_COLOR_WHITE_BACKGROUND[group.intensity],
    color: BACKGROUND_BADGE[group.intensity],
    count: group.storms.length,
    details: (
      <>
        {group.storms.map((storm) => (
          <Text key={`${storm.name}-${storm.year}`} style={styles.storm}>
            <Text
              style={[styles.stormName, { color: TEXT_COLOR_WHITE_BACKGROUND[group.intensity] }]}
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
    <View>
      {storms.length > 0 && (
        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setShowFormula((current) => !current);
          }}
          style={({ pressed }) => [styles.explain, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="How the average intensity is calculated"
          accessibilityState={{ expanded: showFormula }}
        >
          <Ionicons
            name={showFormula ? "information-circle" : "information-circle-outline"}
            size={16}
            color={COLOR.accent}
          />
          <Text style={styles.explainLabel}>
            {showFormula ? "Hide the working" : "How is this averaged?"}
          </Text>
        </Pressable>
      )}

      {showFormula && (
        <AverageFormula average={calculateAverage(storms)} groups={groups} total={storms.length} />
      )}

      <ComparisonBarList heading={heading} emptyText={emptyText} rows={rows} />
    </View>
  );
};

const styles = StyleSheet.create({
  explain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.6,
  },
  explainLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
  formula: {
    marginBottom: 12,
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

export default IntensityBreakdown;
