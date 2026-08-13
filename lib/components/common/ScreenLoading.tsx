import { ActivityIndicator, StyleSheet, View } from "react-native";

const ScreenLoading = () => (
  <View style={styles.root}>
    <ActivityIndicator size="large" color="#2563eb" />
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
