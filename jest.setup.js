// AsyncStorage's real module needs the native side of the bridge, which does not exist under Jest.
// Its shipped mock keeps the store in memory so display-preference code is testable.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
