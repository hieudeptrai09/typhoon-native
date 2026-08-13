import { useApiQuery } from "@/lib/api/client";
import DefModal from "@/lib/components/common/DefModal";
import FrownError from "@/lib/components/common/FrownError";
import TyphoonSpinner from "@/lib/components/common/TyphoonSpinner";
import QuickActionButton from "@/lib/components/home/QuickActionButton";
import { INTENSITY_LABEL, MONTH_NAMES, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { IconName, OnThisDayStorm } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const EXTERNAL_POSITIONS = [141, 142, 143];

const getReasonIcon = (storm: OnThisDayStorm): { icon: IconName; color: string; label: string } => {
  const isExternal = EXTERNAL_POSITIONS.includes(storm.position);

  if (isExternal) {
    if (storm.reason === "both") {
      return {
        icon: "refresh",
        color: "#d97706",
        label: "Entered and exited the West Pacific basin",
      };
    }
    return storm.reason === "started"
      ? { icon: "log-in-outline", color: "#16a34a", label: "Entered the West Pacific basin" }
      : { icon: "log-out-outline", color: "#dc2626", label: "Exited the West Pacific basin" };
  }

  if (storm.reason === "both") {
    return { icon: "refresh", color: "#d97706", label: "Formed and dissipated" };
  }
  return storm.reason === "started"
    ? { icon: "play", color: "#16a34a", label: "Formed" }
    : { icon: "stop", color: "#dc2626", label: "Dissipated" };
};

const getVerb = (storm: OnThisDayStorm) => {
  const isExternal = EXTERNAL_POSITIONS.includes(storm.position);

  if (isExternal) {
    return storm.reason === "both"
      ? "entered and later exited the West Pacific basin or dissipated"
      : storm.reason === "started"
        ? "entered the West Pacific basin"
        : "exited the West Pacific basin or dissipated";
  }
  return storm.reason === "both"
    ? "formed and dissipated"
    : storm.reason === "started"
      ? "formed"
      : "dissipated";
};

const getEventYear = (storm: OnThisDayStorm) => {
  const date = storm.reason === "ended" ? storm.dateEnd : storm.dateStart;
  return date ? Number(date.slice(0, 4)) : storm.year;
};

// The web build fetched on click and pushed the result into an antd modal. Here the sheet opens
// straight away and shows the fetch inline, so the tap never sits with no feedback.
const OnThisDay = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const { data, isLoading, isError, refetch } = useApiQuery<OnThisDayStorm[]>(
    isOpen ? `/api/v1/on-this-day?day=${today.getDate()}&month=${today.getMonth() + 1}` : null,
  );

  const storms = data ?? [];
  const dateLabel = `${MONTH_NAMES[today.getMonth() + 1]} ${today.getDate()}`;

  return (
    <>
      <QuickActionButton
        icon="calendar-outline"
        label="On this day"
        onPress={() => setIsOpen(true)}
      />

      <DefModal open={isOpen} onClose={() => setIsOpen(false)} title="On this day">
        {isLoading ? (
          <View style={styles.center}>
            <TyphoonSpinner />
          </View>
        ) : isError ? (
          <FrownError onRetry={refetch} />
        ) : storms.length === 0 ? (
          <Text style={styles.empty}>No storms formed or dissipated on this day.</Text>
        ) : (
          <View>
            <Text style={styles.date}>{dateLabel}</Text>

            <View style={styles.list}>
              {storms.map((storm, index) => {
                const { icon, color, label } = getReasonIcon(storm);

                return (
                  <View key={index} style={styles.item}>
                    <Ionicons name={icon} size={14} color={color} accessibilityLabel={label} />
                    <Text style={styles.text}>
                      {getEventYear(storm)}: {INTENSITY_LABEL[storm.intensity]}{" "}
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
                      {getVerb(storm)}
                    </Text>
                  </View>
                );
              })}
            </View>
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
  date: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 14,
    color: "#334155",
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  text: {
    flex: 1,
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
  name: {
    fontFamily: "OpenSans_700Bold",
  },
});

export default OnThisDay;
