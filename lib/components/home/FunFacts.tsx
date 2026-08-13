import { useApiQuery } from "@/lib/api/client";
import DefModal from "@/lib/components/common/DefModal";
import FrownError from "@/lib/components/common/FrownError";
import TyphoonSpinner from "@/lib/components/common/TyphoonSpinner";
import QuickActionButton from "@/lib/components/home/QuickActionButton";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const FunFacts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useApiQuery<string | null>(
    isOpen ? "/api/v1/random-fact" : null,
  );

  return (
    <>
      <QuickActionButton
        icon="bulb-outline"
        label="Useless Facts"
        onPress={() => setIsOpen(true)}
      />

      <DefModal open={isOpen} onClose={() => setIsOpen(false)} title="Did you know?">
        {isLoading ? (
          <View style={styles.center}>
            <TyphoonSpinner />
          </View>
        ) : isError ? (
          <FrownError onRetry={refetch} />
        ) : (
          <Text style={styles.fact}>{data ?? "No facts available."}</Text>
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
  fact: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
    color: "#475569",
    paddingVertical: 4,
  },
});

export default FunFacts;
