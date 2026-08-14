import TyphoonSpinner from "@/lib/components/common/TyphoonSpinner";
import { StyleSheet, View } from "react-native";

const ScreenLoading = () => (
  <View style={styles.root}>
    <TyphoonSpinner size="large" />
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScreenLoading;
