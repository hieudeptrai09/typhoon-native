import { useApiQuery } from "@/lib/api/client";
import DefModal from "@/lib/components/common/DefModal";
import FrownError from "@/lib/components/common/FrownError";
import TyphoonSpinner from "@/lib/components/common/TyphoonSpinner";
import QuickActionButton from "@/lib/components/home/QuickActionButton";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { ActiveOnThisDayStorm } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Local-midnight Date from "YYYY-MM-DD", so day math matches the user's clock.
const parseLocalDate = (date: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const groupBySeasonYear = (storms: ActiveOnThisDayStorm[]): [number, ActiveOnThisDayStorm[]][] => {
  const groups = new Map<number, ActiveOnThisDayStorm[]>();

  for (const storm of storms) {
    const group = groups.get(storm.year);
    if (group) group.push(storm);
    else groups.set(storm.year, [storm]);
  }

  return [...groups.entries()].sort(([a], [b]) => a - b);
};

const getDayProgress = (storm: ActiveOnThisDayStorm) => {
  const startDate = parseLocalDate(storm.dateStart);
  const today = new Date();

  // An ongoing storm has no end date: count real days since it formed.
  if (!storm.dateEnd) {
    const dayOfStorm = Math.round((today.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
    return { dayOfStorm, totalDays: null };
  }

  const endDate = parseLocalDate(storm.dateEnd);
  const todayMonth = today.getMonth() + 1;
  const anniversaryYear =
    todayMonth >= startDate.getMonth() + 1 ? startDate.getFullYear() : endDate.getFullYear();
  const anniversaryDate = new Date(anniversaryYear, todayMonth - 1, today.getDate());

  const dayOfStorm = Math.round((anniversaryDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
  return { dayOfStorm, totalDays };
};

const ActiveStorms = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const { data, isLoading, isError, refetch } = useApiQuery<ActiveOnThisDayStorm[]>(
    isOpen
      ? `/api/v1/on-this-day-active?day=${today.getDate()}&month=${today.getMonth() + 1}`
      : null,
  );

  const storms = data ?? [];

  return (
    <>
      <QuickActionButton
        icon="water-outline"
        label="Active on this day"
        onPress={() => setIsOpen(true)}
      />

      <DefModal open={isOpen} onClose={() => setIsOpen(false)} title="Active on this day">
        {isLoading ? (
          <View style={styles.center}>
            <TyphoonSpinner />
          </View>
        ) : isError ? (
          <FrownError onRetry={refetch} />
        ) : storms.length === 0 ? (
          <Text style={styles.empty}>No storms were active on this date in past years.</Text>
        ) : (
          <View style={styles.years}>
            <Text style={styles.caption}>
              Storms that were in progress on this date in past years
            </Text>

            {groupBySeasonYear(storms).map(([year, yearStorms]) => (
              <View key={year} style={styles.year}>
                <Text style={styles.yearLabel}>{year}</Text>

                {yearStorms.map((storm, index) => {
                  const { dayOfStorm, totalDays } = getDayProgress(storm);

                  return (
                    <View key={index} style={styles.item}>
                      <Text style={styles.ordinal}>{index + 1}.</Text>

                      <View style={styles.itemBody}>
                        <Text style={styles.text}>
                          {INTENSITY_LABEL[storm.intensity]}{" "}
                          <Text
                            style={[
                              styles.name,
                              { color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] },
                            ]}
                            onPress={() => {
                              setIsOpen(false);
                              router.push(`/info/${storm.name.toLowerCase()}`);
                            }}
                          >
                            {storm.name}
                          </Text>{" "}
                          ({formatStormDateRange(storm.dateStart, storm.dateEnd ?? undefined)})
                        </Text>

                        <Text style={styles.progress}>
                          Day <Text style={styles.progressValue}>{dayOfStorm}</Text>
                          {totalDays !== null ? (
                            <>
                              /<Text style={styles.progressValue}>{totalDays}</Text>
                            </>
                          ) : null}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </DefModal>
    </>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    paddingVertical: 32,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: "#475569",
    paddingVertical: 12,
  },
  caption: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#334155",
  },
  years: {
    gap: 16,
  },
  year: {
    gap: 8,
  },
  yearLabel: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 14,
    color: "#334155",
    fontVariant: ["tabular-nums"],
  },
  item: {
    flexDirection: "row",
    gap: 8,
    paddingLeft: 4,
  },
  ordinal: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: "#94a3b8",
    fontVariant: ["tabular-nums"],
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
  name: {
    fontFamily: "OpenSans_700Bold",
  },
  progress: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: "#64748b",
  },
  progressValue: {
    fontFamily: "OpenSans_600SemiBold",
    color: "#334155",
    fontVariant: ["tabular-nums"],
  },
});

export default ActiveStorms;
