import { COLOR } from "@/lib/constants/theme";
import { DAYS_OF_YEAR, MONTH_START_INDEX } from "@/lib/utils/date";
import { StyleSheet, Text, View } from "react-native";

const MONTH_LETTERS = "JFMAMJJASOND";
const MID_MONTH = 15;
const LETTER_WIDTH = 12;

const MonthAxis = ({ width }: { width: number }) => {
  const slot = width / DAYS_OF_YEAR.length;

  return (
    <View style={styles.root} pointerEvents="none">
      {MONTH_START_INDEX.map((start, index) => (
        <Text
          key={start}
          style={[styles.month, { left: (start + MID_MONTH) * slot - LETTER_WIDTH / 2 }]}
          numberOfLines={1}
        >
          {MONTH_LETTERS[index]}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    height: 13,
  },
  month: {
    position: "absolute",
    width: LETTER_WIDTH,
    textAlign: "center",
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 9,
    color: COLOR.textFaint,
  },
});

export default MonthAxis;
